import { describe, expect, it, vi } from "vitest";
import { ApproveSaleUseCase } from "../approve-sale-use-case";
import { CancelSaleUseCase } from "../cancel-sale-use-case";
import type { SaleRecord, SaleRepository } from "@/modules/sales/domain";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type {
  CommissionEntryData,
  CommissionEntryRepository,
  CommissionRuleData,
  CommissionRuleRepository,
} from "@/modules/commissions/domain";
import type {
  EmployeeCommissionContextPort,
} from "@/modules/organization/domain";
import type {
  SaleCommissionTransactionContext,
  SaleCommissionTransactionPort,
} from "../sale-commission-transaction-port";
import type { AuditPort } from "@/shared/ports/audit-port";

const now = new Date("2026-09-07T12:00:00.000Z");

function sale(status: SaleRecord["status"]): SaleRecord {
  return {
    id: "sale-1",
    saleNumber: 1,
    employeeId: "employee-1",
    saleDate: new Date("2026-09-01"),
    status,
    totalAmount: 100_000,
    approvedAt: status === "APPROVED" ? now : null,
    buyerName: null,
    rejectionReason: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    items: [],
  };
}

function transactionContext(saleStatus: SaleRecord["status"]): {
  context: SaleCommissionTransactionContext;
  updateStatusIfCurrent: ReturnType<typeof vi.fn>;
  createEntry: ReturnType<typeof vi.fn>;
} {
  const updateStatusIfCurrent = vi.fn().mockResolvedValue(sale(
    saleStatus === "PENDING_REVIEW" ? "APPROVED" : "CANCELLED",
  ));
  const createEntry = vi.fn().mockImplementation(async (input) => ({
    id: input.type === "EARNED" ? "earned-1" : "reversal-1",
    ...input,
    parentId: input.parentId ?? null,
    calculatedAt: now,
    createdAt: now,
  }));

  const saleRepository = {
    findById: vi.fn().mockResolvedValue(sale(saleStatus)),
    updateStatusIfCurrent,
  } as unknown as SaleRepository;
  const organizationRepository: EmployeeCommissionContextPort = {
    getEmployeeCommissionContext: vi.fn().mockResolvedValue({
      employeeId: "employee-1",
      levelId: 3,
      joinedAt: new Date("2024-01-01"),
    }),
  };
  const rule: CommissionRuleData = {
    id: "rule-3",
    levelId: 3,
    percentage: 30,
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: null,
    createdAt: now,
    updatedAt: now,
  };
  const entry: CommissionEntryData = {
    id: "earned-1",
    saleId: "sale-1",
    employeeId: "employee-1",
    ruleId: "rule-3",
    parentId: null,
    type: "EARNED",
    percentage: 30,
    baseAmount: 100_000,
    amount: 30_000,
    saleDate: new Date("2026-09-01"),
    calculatedAt: now,
    createdAt: now,
  };
  const commissionEntryRepository: CommissionEntryRepository = {
    findEarnedBySaleId: vi.fn().mockResolvedValue(
      saleStatus === "APPROVED" ? entry : null,
    ),
    findEarnedByEmployeeIds: vi.fn().mockResolvedValue([]),
    findSaleIdsByIds: vi.fn().mockResolvedValue([]),
    findEarnedAmountsBySaleIds: vi.fn().mockResolvedValue([]),
    findReversalByParentId: vi.fn().mockResolvedValue(null),
    create: createEntry,
    findBySaleId: vi.fn().mockResolvedValue([]),
  };
  const commissionRuleRepository: CommissionRuleRepository = {
    findApplicable: vi.fn().mockResolvedValue(rule),
    findOverlapping: vi.fn(),
    findLevelIdsByIds: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    closeAt: vi.fn(),
  };

  return {
    context: {
      saleRepository,
      organizationRepository,
      commissionRuleRepository,
      commissionEntryRepository,
    },
    updateStatusIfCurrent,
    createEntry,
  };
}

function allowAuth(): AuthorizationService {
  return { authorize: vi.fn().mockResolvedValue({ allowed: true, permission: "sale.approve" }) };
}

function transaction(context: SaleCommissionTransactionContext): SaleCommissionTransactionPort {
  return { execute: async (fn) => fn(context) };
}

const mockAuditPort: AuditPort = {
  log: vi.fn().mockResolvedValue(undefined),
};

function makeAuthContext() {
  return { userId: "u", employeeId: "supervisor", levelId: 3, role: "SELLER" as const, supervisorId: null, userEmail: "supervisor@example.com" };
}

describe("sale and commission transaction integration", () => {
  it("approves and creates exactly one earned entry in the same orchestration", async () => {
    const { context, updateStatusIfCurrent, createEntry } = transactionContext("PENDING_REVIEW");
    const result = await new ApproveSaleUseCase(
      allowAuth(),
      context.saleRepository,
      mockAuditPort,
      transaction(context),
    ).execute({
      authContext: makeAuthContext(),
      saleId: "sale-1",
    });

    expect("commission" in result).toBe(true);
    if (!("commission" in result)) throw new Error("Commission was not generated.");
    expect(result.commission.type).toBe("EARNED");
    expect(updateStatusIfCurrent).toHaveBeenCalledWith(
      "sale-1",
      "PENDING_REVIEW",
      "APPROVED",
      undefined,
      expect.any(Date),
    );
    expect(createEntry).toHaveBeenCalledOnce();
  });

  it("cancels and creates a reversal linked to the original entry", async () => {
    const { context, updateStatusIfCurrent, createEntry } = transactionContext("APPROVED");
    const result = await new CancelSaleUseCase(
      { authorize: vi.fn().mockResolvedValue({ allowed: true, permission: "sale.cancel" }) },
      context.saleRepository,
      mockAuditPort,
      transaction(context),
    ).execute({
      authContext: makeAuthContext(),
      saleId: "sale-1",
    });

    expect("reversal" in result).toBe(true);
    if (!("reversal" in result)) throw new Error("Reversal was not generated.");
    expect(result.reversal.type).toBe("REVERSAL");
    expect(result.reversal.parentId).toBe("earned-1");
    expect(updateStatusIfCurrent).toHaveBeenCalledWith("sale-1", "APPROVED", "CANCELLED");
    expect(createEntry).toHaveBeenCalledOnce();
  });

  it("rejects a concurrent approval when the conditional transition loses the race", async () => {
    const { context, updateStatusIfCurrent, createEntry } = transactionContext("PENDING_REVIEW");
    updateStatusIfCurrent.mockResolvedValue(null);

    await expect(
      new ApproveSaleUseCase(
        allowAuth(),
        context.saleRepository,
        mockAuditPort,
        transaction(context),
      ).execute({
        authContext: makeAuthContext(),
        saleId: "sale-1",
      }),
    ).rejects.toThrow("already approved");
    expect(createEntry).not.toHaveBeenCalled();
  });

  it("rejects a concurrent cancellation when the conditional transition loses the race", async () => {
    const { context, updateStatusIfCurrent, createEntry } = transactionContext("APPROVED");
    updateStatusIfCurrent.mockResolvedValue(null);

    await expect(
      new CancelSaleUseCase(
        { authorize: vi.fn().mockResolvedValue({ allowed: true, permission: "sale.cancel" }) },
        context.saleRepository,
        mockAuditPort,
        transaction(context),
      ).execute({
        authContext: makeAuthContext(),
        saleId: "sale-1",
      }),
    ).rejects.toThrow("already cancelled");
    expect(createEntry).not.toHaveBeenCalled();
  });
});
