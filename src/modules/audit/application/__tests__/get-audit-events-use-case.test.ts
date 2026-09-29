import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAuditEventsUseCase } from "../get-audit-events-use-case";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuditEventRepository } from "@/modules/audit/domain/audit-event-repository";
import { AuditAction } from "@/shared/ports/audit-port";

function makeAuthContext(overrides?: Record<string, unknown>) {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: null,
    role: "ADMIN" as const,
    supervisorId: null,
    userEmail: "admin@example.com",
    ...overrides,
  };
}

function makeAllowAuth(): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue({
      allowed: true,
      permission: "audit.read",
    }),
  };
}

function makeDenyAuth(): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue({
      allowed: false,
      permission: "audit.read",
      reason: "Not authorized",
    }),
  };
}

function makeAuditEventRepository(
  overrides?: Partial<AuditEventRepository>,
): AuditEventRepository {
  return {
    findMany: vi.fn().mockResolvedValue({
      events: [
        {
          id: "event-1",
          actorId: "user-1",
          actorEmail: "admin@example.com",
          action: AuditAction.LOGIN_SUCCESS,
          resourceType: "UserAccount",
          resourceId: "user-1",
          result: "SUCCESS",
          correlationId: null,
          metadata: null,
          createdAt: new Date("2026-09-07T12:00:00Z"),
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    }),
    countByResult: vi.fn().mockResolvedValue([{ result: "SUCCESS", count: 1 }]),
    getDailyActivity: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("GetAuditEventsUseCase", () => {
  let auth: AuthorizationService;
  let repo: AuditEventRepository;
  let useCase: GetAuditEventsUseCase;

  beforeEach(() => {
    auth = makeAllowAuth();
    repo = makeAuditEventRepository();
    useCase = new GetAuditEventsUseCase(auth, repo);
  });

  it("returns audit events when authorized", async () => {
    const result = await useCase.execute({
      authContext: makeAuthContext(),
    });

    expect(result.events).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.events[0].action).toBe(AuditAction.LOGIN_SUCCESS);
    expect(auth.authorize).toHaveBeenCalledOnce();
  });

  it("throws AuthorizationError when not authorized", async () => {
    const denyAuth = makeDenyAuth();
    const denyUseCase = new GetAuditEventsUseCase(denyAuth, repo);

    await expect(
      denyUseCase.execute({
        authContext: makeAuthContext(),
      }),
    ).rejects.toThrow("Not authorized");
  });

  it("passes filters to repository", async () => {
    await useCase.execute({
      authContext: makeAuthContext(),
      filters: {
        action: AuditAction.LOGIN_SUCCESS,
        resourceType: "UserAccount",
        result: "SUCCESS",
      },
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        action: AuditAction.LOGIN_SUCCESS,
        resourceType: "UserAccount",
        result: "SUCCESS",
      },
      expect.any(Object),
    );
  });

  it("passes pagination to repository", async () => {
    await useCase.execute({
      authContext: makeAuthContext(),
      page: 2,
      pageSize: 10,
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.any(Object),
      {
        page: 2,
        pageSize: 10,
      },
    );
  });

  it("returns empty results when no events match", async () => {
    const emptyRepo = makeAuditEventRepository({
      findMany: vi.fn().mockResolvedValue({
        events: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
      }),
    });
    const emptyUseCase = new GetAuditEventsUseCase(auth, emptyRepo);

    const result = await emptyUseCase.execute({
      authContext: makeAuthContext(),
    });

    expect(result.events).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});
