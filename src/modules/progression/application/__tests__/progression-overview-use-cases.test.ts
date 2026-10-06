/**
 * Progression overview use case tests.
 *
 * Covers the read models behind "Progreso del objetivo": the personal timeline
 * and the supervisor's team overview.
 *
 * Reference: requirements.md §3.13, business-rules.md REG-055, REG-066,
 * REG-067, REG-078, REG-082, REG-083
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GetPersonalProgressionUseCase } from "../get-personal-progression-use-case";
import { GetTeamProgressionUseCase } from "../get-team-progression-use-case";
import { GetEmployeeProgressionUseCase } from "../get-employee-progression-use-case";
import type { ProgressEntry } from "@/modules/progression/domain";
import type { ProgressionRepository } from "@/modules/progression/domain/progression-repository";
import type {
  EmployeeRecord,
  OrganizationRepository,
} from "@/modules/organization/domain";
import type {
  SaleRecord,
  SaleRepository,
  SaleStatusRow,
} from "@/modules/sales/domain";
import type { Visit, VisitRepository, VisitStatusCounts } from "@/modules/visits/domain";
import type {
  CommissionEntryData,
  CommissionEntryRepository,
} from "@/modules/commissions/domain";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import { AuthorizationError } from "@/shared/errors";

function makeAllowDecision(permission: string): AuthorizationDecision {
  return {
    allowed: true,
    permission: permission as Permission,
    reason: "granted",
  };
}

function makeDenyDecision(permission: string): AuthorizationDecision {
  return {
    allowed: false,
    permission: permission as Permission,
    reason: `Not authorized: ${permission} not granted.`,
  };
}

// =============================================================================
// Helpers
//
// Dates are built with local components on purpose: the read models compare
// calendar months.
// =============================================================================

const NOW = new Date(2026, 3, 15, 12);

function makeEmployee(overrides?: Partial<EmployeeRecord>): EmployeeRecord {
  return {
    id: "emp-1",
    employeeCode: 1,
    firstName: "Juan",
    lastName: "Pérez",
    dni: "30111222",
    email: "juan@example.com",
    phone: null,
    dateOfBirth: null,
    joinedAt: new Date(2026, 0, 15),
    currentLevelId: 3,
    supervisorId: null,
    status: "ACTIVE",
    deactivatedAt: null,
    deactivationReason: null,
    street: null,
    streetNumber: null,
    floor: null,
    apartment: null,
    city: null,
    province: null,
    postalCode: null,
    createdAt: new Date(2026, 0, 15),
    updatedAt: new Date(2026, 0, 15),
    ...overrides,
  };
}

function makeVisit(overrides?: Partial<Visit>): Visit {
  return {
    id: "visit-1",
    visitNumber: 1,
    sellerId: "emp-1",
    sellerName: "Juan Pérez",
    clientId: "client-1",
    clientName: "Cliente Uno",
    assignedById: "sup-1",
    scheduledDate: new Date(2026, 0, 20),
    status: "completed",
    createdAt: new Date(2026, 0, 15),
    updatedAt: new Date(2026, 0, 20),
    ...overrides,
  };
}

function makeSale(overrides?: Partial<SaleRecord>): SaleRecord {
  return {
    id: "sale-1",
    saleNumber: 7,
    employeeId: "emp-1",
    saleDate: new Date(2026, 1, 10),
    status: "APPROVED",
    totalAmount: 1000,
    approvedAt: new Date(2026, 1, 11),
    buyerName: "Comprador",
    rejectionReason: null,
    notes: null,
    visitId: "visit-1",
    clientId: "client-1",
    createdAt: new Date(2026, 1, 10),
    updatedAt: new Date(2026, 1, 11),
    items: [{ id: "item-1", saleId: "sale-1", productId: "p1", quantity: 2, unitPrice: 500, subtotal: 1000, createdAt: new Date(2026, 1, 10), updatedAt: new Date(2026, 1, 10) }],
    ...overrides,
  };
}

function makeEntry(
  overrides: Partial<ProgressEntry> & Pick<ProgressEntry, "type" | "points">,
): ProgressEntry {
  return {
    id: "entry-1",
    employeeId: "emp-1",
    description: null,
    period: null,
    createdAt: new Date(2026, 2, 1),
    ...overrides,
  };
}

function makeCommissionEntry(
  overrides?: Partial<CommissionEntryData>,
): CommissionEntryData {
  return {
    id: "ce-1",
    saleId: "sale-1",
    employeeId: "emp-1",
    ruleId: "rule-1",
    parentId: null,
    type: "EARNED",
    percentage: 3,
    baseAmount: 1000,
    amount: 30,
    saleDate: new Date(2026, 2, 5),
    calculatedAt: new Date(2026, 2, 5),
    createdAt: new Date(2026, 2, 5),
    ...overrides,
  };
}

function makeProgressionRepo(
  overrides?: Partial<ProgressionRepository>,
): ProgressionRepository {
  return {
    getEntriesByEmployee: vi.fn().mockResolvedValue([]),
    getEntriesByEmployees: vi.fn().mockResolvedValue([]),
    getEntriesByPeriod: vi.fn().mockResolvedValue([]),
    recordEntry: vi.fn(),
    recordEntries: vi.fn().mockResolvedValue(undefined),
    hasTargetBonus: vi.fn().mockResolvedValue(false),
    getPointsSummaryByEmployees: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  } as ProgressionRepository;
}

function makeOrgRepo(
  overrides?: Partial<OrganizationRepository>,
): OrganizationRepository {
  return {
    findEmployeeById: vi.fn().mockResolvedValue(makeEmployee()),
    getDirectSubordinates: vi.fn().mockResolvedValue([]),
    findOpenLevelHistory: vi.fn().mockResolvedValue(null),
    findOpenLevelHistories: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as OrganizationRepository;
}

function makeSaleRepo(
  overrides?: Partial<SaleRepository>,
): SaleRepository {
  return {
    countApprovedSince: vi.fn().mockResolvedValue(0),
    countApprovedInPeriod: vi.fn().mockResolvedValue(0),
    countApprovedSinceByEmployee: vi.fn().mockResolvedValue(new Map()),
    getMonthlyTarget: vi.fn().mockResolvedValue(0),
    countInPeriodByEmployee: vi.fn().mockResolvedValue(new Map()),
    countInPeriodForEmployees: vi.fn().mockResolvedValue(0),
    findApprovedByEmployeeId: vi.fn().mockResolvedValue([]),
    findByVisitIds: vi.fn().mockResolvedValue([]),
    findStatusRowsByEmployeeIds: vi.fn().mockResolvedValue([]),
    getMonthlyTargetsByLevelIds: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  } as unknown as SaleRepository;
}

function makeVisitRepo(
  overrides?: Partial<VisitRepository>,
): VisitRepository {
  return {
    findBySellerId: vi.fn().mockResolvedValue([]),
    findBySellerIds: vi.fn().mockResolvedValue([]),
    countStatusBySellerIds: vi.fn().mockResolvedValue(new Map()),
    countCompletedBySellerIdSince: vi.fn().mockResolvedValue(0),
    countCompletedBySellerIdSinceBatch: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  } as unknown as VisitRepository;
}

function makeCommissionRepo(
  overrides?: Partial<CommissionEntryRepository>,
): CommissionEntryRepository {
  return {
    findEarnedBySaleId: vi.fn().mockResolvedValue(null),
    findReversalByParentId: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    findBySaleId: vi.fn().mockResolvedValue([]),
    findEarnedByEmployeeIds: vi.fn().mockResolvedValue([]),
    findEarnedAmountsBySaleIds: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as CommissionEntryRepository;
}

function makeAuth(
  overrides?: Partial<AuthorizationService>,
): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue(makeAllowDecision("analytics.viewTeam")),
    ...overrides,
  } as AuthorizationService;
}

const authContext: AuthorizationContext = {
  userId: "user-sup",
  employeeId: "sup-1",
  levelId: 4,
  role: "SELLER",
  supervisorId: null,
  userEmail: "sup@example.com",
};

// =============================================================================
// GetPersonalProgressionUseCase
// =============================================================================

describe("GetPersonalProgressionUseCase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when the employee record does not exist", async () => {
    const orgRepo = makeOrgRepo({
      findEmployeeById: vi.fn().mockResolvedValue(null),
    });
    const uc = new GetPersonalProgressionUseCase(
      makeProgressionRepo(),
      orgRepo,
      makeSaleRepo(),
      makeVisitRepo(),
    );

    await expect(
      uc.execute({ employeeId: "missing" }),
    ).resolves.toBeNull();
  });

  it("builds the timeline from seniority, visits, sales and target bonuses", async () => {
    const visitRepo = makeVisitRepo({
      findBySellerId: vi.fn().mockResolvedValue([
        makeVisit({ id: "v1", scheduledDate: new Date(2026, 0, 20) }),
        makeVisit({
          id: "v2",
          status: "no_sale",
          scheduledDate: new Date(2026, 1, 5),
        }),
        // Not performed: must not appear in the timeline
        makeVisit({
          id: "v3",
          status: "assigned",
          scheduledDate: new Date(2026, 2, 1),
        }),
      ]),
    });
    const saleRepo = makeSaleRepo({
      findApprovedByEmployeeId: vi
        .fn()
        .mockResolvedValue([makeSale({ saleNumber: 12, buyerName: "Ana" })]),
    });
    const progressionRepo = makeProgressionRepo({
      getEntriesByEmployee: vi.fn().mockResolvedValue([
        makeEntry({
          type: "TARGET_ACHIEVED",
          points: 10,
          period: "2026-02",
          createdAt: new Date(2026, 1, 28),
        }),
        makeEntry({
          type: "SALE",
          points: 5,
          createdAt: new Date(2026, 1, 15),
        }),
      ]),
    });

    const uc = new GetPersonalProgressionUseCase(
      progressionRepo,
      makeOrgRepo(),
      saleRepo,
      visitRepo,
    );

    const result = await uc.execute({ employeeId: "emp-1" });

    expect(result).not.toBeNull();
    const entries = result!.entries;
    // 3 seniority months (Jan 15 -> Apr 15) + 2 visits + 1 sale + 1 target
    expect(entries.filter((e) => e.type === "SENIORITY")).toHaveLength(3);
    expect(entries.filter((e) => e.type === "VISIT")).toHaveLength(2);
    expect(entries.filter((e) => e.type === "SALE")).toHaveLength(1);
    expect(entries.filter((e) => e.type === "TARGET")).toHaveLength(1);

    const saleEntry = entries.find((e) => e.type === "SALE");
    expect(saleEntry?.description).toBe("Venta aprobada VT-0012 — Ana");
    const targetEntry = entries.find((e) => e.type === "TARGET");
    expect(targetEntry?.description).toContain("2026-02");
    expect(result!.threshold).toBe(350);
    expect(result!.joinedAt).toEqual(new Date(2026, 0, 15));
  });
});

// =============================================================================
// GetTeamProgressionUseCase
// =============================================================================

describe("GetTeamProgressionUseCase", () => {
  const member = makeEmployee({ id: "emp-1", firstName: "Juan", currentLevelId: 3 });

  function makeUseCase(
    overrides: {
      auth?: AuthorizationService;
      org?: OrganizationRepository;
      visits?: VisitRepository;
      sales?: SaleRepository;
      commissions?: CommissionEntryRepository;
      progressionRepo?: ProgressionRepository;
    } = {},
  ) {
    const progressionRepo = overrides.progressionRepo ?? makeProgressionRepo();
    const org = overrides.org ?? makeOrgRepo();
    const visits = overrides.visits ?? makeVisitRepo();
    const sales = overrides.sales ?? makeSaleRepo();
    const commissions = overrides.commissions ?? makeCommissionRepo();

    return new GetTeamProgressionUseCase(
      overrides.auth ?? makeAuth(),
      org,
      visits,
      sales,
      commissions,
      new GetEmployeeProgressionUseCase(
        progressionRepo,
        org,
        sales,
        visits,
      ),
    );
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("denies the request when the user cannot view team analytics", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(makeDenyDecision("analytics.viewTeam")),
    });
    const uc = makeUseCase({ auth });

    await expect(uc.execute({ authContext })).rejects.toBeInstanceOf(
      AuthorizationError,
    );
  });

  it("excludes inactive subordinates from members, history and commissions", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([
        member,
        makeEmployee({
          id: "emp-2",
          firstName: "Ana",
          status: "INACTIVE",
          currentLevelId: 3,
        }),
      ]),
    });
    const visits = makeVisitRepo({
      findBySellerIds: vi.fn().mockResolvedValue([
        makeVisit({ id: "v1", sellerId: "emp-1", status: "no_sale" }),
      ]),
    });
    const commissions = makeCommissionRepo();

    const result = await makeUseCase({ org, visits, commissions }).execute({
      authContext,
    });

    expect(result.members).toHaveLength(1);
    expect(result.teamHistory).toHaveLength(1);
    expect(visits.findBySellerIds).toHaveBeenCalledWith(["emp-1"]);
    expect(commissions.findEarnedByEmployeeIds).toHaveBeenCalledWith(["emp-1"]);
  });

  it("builds member cards with visit counts, monthly sales and objective progress", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const counts = new Map<string, VisitStatusCounts>([
      ["emp-1", { total: 10, completed: 6, pending: 4 }],
    ]);
    const visits = makeVisitRepo({
      countStatusBySellerIds: vi.fn().mockResolvedValue(counts),
    });
    const sales = makeSaleRepo({
      countInPeriodByEmployee: vi.fn().mockResolvedValue(new Map([["emp-1", 8]])),
      getMonthlyTargetsByLevelIds: vi.fn().mockResolvedValue(new Map([[3, 10]])),
    });

    const result = await makeUseCase({ org, visits, sales }).execute({
      authContext,
    });

    const row = result.members[0];
    expect(row.assignedVisits).toBe(10);
    expect(row.completedVisits).toBe(6);
    expect(row.pendingVisits).toBe(4);
    expect(row.monthlySales).toBe(8);
    expect(row.monthlyTarget).toBe(10);
    expect(row.objectiveProgress).toBe(80);
    // Objective progress uses APPROVED + PENDING_REVIEW for the current month
    expect(sales.countInPeriodByEmployee).toHaveBeenCalledWith(
      ["emp-1"],
      new Date(2026, 3, 1),
      new Date(2026, 3, 30, 23, 59, 59, 999),
      ["APPROVED", "PENDING_REVIEW"],
    );
  });

  it("falls back to the default monthly objective when the level has none", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const sales = makeSaleRepo({
      getMonthlyTargetsByLevelIds: vi.fn().mockResolvedValue(new Map()),
    });

    const result = await makeUseCase({ org, sales }).execute({ authContext });

    expect(result.members[0].monthlyTarget).toBe(15);
    expect(result.teamTarget.targetTotal).toBe(15);
  });

  it("caps the member objective progress at 100", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const sales = makeSaleRepo({
      countInPeriodByEmployee: vi.fn().mockResolvedValue(new Map([["emp-1", 99]])),
      getMonthlyTargetsByLevelIds: vi.fn().mockResolvedValue(new Map([[3, 10]])),
    });

    const result = await makeUseCase({ org, sales }).execute({ authContext });

    expect(result.members[0].objectiveProgress).toBe(100);
  });

  it("computes the team objective over all subordinates, active or not", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([
        member,
        makeEmployee({ id: "emp-2", status: "INACTIVE", currentLevelId: 3 }),
      ]),
    });
    const sales = makeSaleRepo({
      getMonthlyTargetsByLevelIds: vi
        .fn()
        .mockResolvedValue(new Map([[3, 10], [4, 10]])),
      countInPeriodForEmployees: vi.fn().mockResolvedValue(12),
    });

    const result = await makeUseCase({ org, sales }).execute({ authContext });

    // Supervisor level target (N4 -> 10) x 2 subordinates
    expect(result.teamTarget.targetTotal).toBe(20);
    expect(result.teamTarget.currentSales).toBe(12);
    expect(result.teamTarget.progress).toBe(60);
    expect(sales.countInPeriodForEmployees).toHaveBeenCalledWith(
      ["emp-1", "emp-2"],
      expect.any(Date),
      expect.any(Date),
      ["APPROVED", "PENDING_REVIEW"],
    );
  });

  it("hides completed visits whose sale is still in draft (REG-067)", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const visits = makeVisitRepo({
      findBySellerIds: vi.fn().mockResolvedValue([
        makeVisit({ id: "v-draft", status: "completed" }),
        makeVisit({ id: "v-no-sale", status: "no_sale" }),
        makeVisit({ id: "v-assigned", status: "assigned" }),
        makeVisit({ id: "v-cancelled", status: "cancelled" }),
      ]),
    });
    const sales = makeSaleRepo({
      findByVisitIds: vi.fn().mockResolvedValue([
        makeSale({ id: "s-draft", visitId: "v-draft", status: "DRAFT" }),
      ]),
    });

    const result = await makeUseCase({ org, visits, sales }).execute({
      authContext,
    });

    // The draft sale and the assigned visit produce no row
    expect(result.teamHistory.map((r) => r.status).sort()).toEqual([
      "NO_SALE",
      "VISIT_CANCELLED",
    ]);
    expect(result.teamHistory.every((r) => r.productCount === undefined)).toBe(
      true,
    );
    // Assigned visits are not history, but they are listed for period filtering
    expect(result.teamVisits).toHaveLength(4);
  });

  it("resolves the sale outcome of a performed visit", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const visits = makeVisitRepo({
      findBySellerIds: vi.fn().mockResolvedValue([
        makeVisit({
          id: "v1",
          sellerName: "Juan Pérez",
          scheduledDate: new Date(2026, 2, 1),
        }),
      ]),
    });
    const sales = makeSaleRepo({
      findByVisitIds: vi.fn().mockResolvedValue([
        makeSale({
          id: "s1",
          visitId: "v1",
          status: "PENDING_REVIEW",
          totalAmount: 5000,
          items: [
            { id: "i1", saleId: "s1", productId: "p1", quantity: 3, unitPrice: 1000, subtotal: 3000, createdAt: new Date(2026, 2, 1), updatedAt: new Date(2026, 2, 1) },
            { id: "i2", saleId: "s1", productId: "p2", quantity: 2, unitPrice: 1000, subtotal: 2000, createdAt: new Date(2026, 2, 1), updatedAt: new Date(2026, 2, 1) },
          ],
        }),
      ]),
    });

    const result = await makeUseCase({ org, visits, sales }).execute({
      authContext,
    });

    expect(result.teamHistory).toEqual([
      {
        date: new Date(2026, 2, 1),
        memberName: "Juan Pérez",
        status: "SALE_PENDING",
        productCount: 5,
        total: 5000,
      },
    ]);
  });

  it("sorts the team history by date descending", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const visits = makeVisitRepo({
      findBySellerIds: vi.fn().mockResolvedValue([
        makeVisit({ id: "old", status: "no_sale", scheduledDate: new Date(2026, 1, 1) }),
        makeVisit({ id: "new", status: "no_sale", scheduledDate: new Date(2026, 2, 20) }),
      ]),
    });

    const result = await makeUseCase({ org, visits }).execute({ authContext });

    expect(result.teamHistory.map((r) => r.date)).toEqual([
      new Date(2026, 2, 20),
      new Date(2026, 1, 1),
    ]);
  });

  it("returns commissions and sale status rows for period filtering", async () => {
    const org = makeOrgRepo({
      getDirectSubordinates: vi.fn().mockResolvedValue([member]),
    });
    const commissions = makeCommissionRepo({
      findEarnedByEmployeeIds: vi
        .fn()
        .mockResolvedValue([makeCommissionEntry({ amount: 42 })]),
    });
    const salesRows: SaleStatusRow[] = [
      { saleDate: new Date(2026, 2, 10), status: "APPROVED" },
      { saleDate: new Date(2026, 2, 11), status: "PENDING_REVIEW" },
    ];
    const sales = makeSaleRepo({
      findStatusRowsByEmployeeIds: vi.fn().mockResolvedValue(salesRows),
    });

    const result = await makeUseCase({ org, commissions, sales }).execute({
      authContext,
    });

    expect(result.commissions).toEqual([
      { date: new Date(2026, 2, 5), amount: 42 },
    ]);
    expect(result.teamSales).toEqual(
      salesRows.map((row) => ({ date: row.saleDate, status: row.status })),
    );
  });
});