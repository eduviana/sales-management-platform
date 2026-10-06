/**
 * Negative authorization tests for the visits module (P3, ADR-020 roadmap).
 *
 * `visit.create`, `visit.update` and `visit.view` are checked before any
 * repository access; ownership is enforced on top of the permission.
 *
 * Reference: business-rules.md REG-066, REG-067, REG-069,
 * permissions-matrix.md §4.7
 */

import { describe, it, expect, vi } from "vitest";
import { CreateVisitUseCase } from "../create-visit-use-case";
import { UpdateVisitUseCase } from "../update-visit-use-case";
import { GetVisitListUseCase } from "../get-visit-list-use-case";
import { CreateClientUseCase } from "../create-client-use-case";
import { GetClientListUseCase } from "../get-client-list-use-case";
import { GetTeamListUseCase } from "../get-team-list-use-case";
import { AuthorizationError } from "@/shared/errors";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import type { OrganizationRepository, EmployeeRecord } from "@/modules/organization/domain";
import type {
  VisitRepository,
  Visit,
  VisitStatus,
  ClientRepository,
  Client,
} from "@/modules/visits/domain";

// =============================================================================
// Helpers
// =============================================================================

function makeAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "sup-1",
    levelId: 3,
    role: "SELLER",
    supervisorId: null,
    userEmail: "supervisor@example.com",
    ...overrides,
  };
}

function makeDenyDecision(permission: string): AuthorizationDecision {
  return {
    allowed: false,
    permission: permission as Permission,
    reason: `Not authorized: ${permission} not granted.`,
  };
}

function makeAllowDecision(permission: string): AuthorizationDecision {
  return {
    allowed: true,
    permission: permission as Permission,
    reason: "granted",
  };
}

function makeAuthService(decision: AuthorizationDecision): {
  service: AuthorizationService;
  authorize: ReturnType<typeof vi.fn>;
} {
  const authorize = vi.fn().mockResolvedValue(decision);
  return { service: { authorize } as unknown as AuthorizationService, authorize };
}

function makeVisit(overrides?: Partial<Visit>): Visit {
  return {
    id: "visit-1",
    visitNumber: 1,
    sellerId: "emp-1",
    clientId: "client-1",
    assignedById: "sup-1",
    scheduledDate: new Date(2026, 3, 10, 10),
    status: "SCHEDULED" as VisitStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeClient(overrides?: Partial<Client>): Client {
  return {
    id: "client-1",
    clientNumber: 1,
    name: "María López",
    street: "Av. Siempreviva",
    streetNumber: "742",
    city: "Córdoba",
    province: "Córdoba",
    ownerEmployeeId: "emp-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeVisitRepo(overrides?: Partial<VisitRepository>): VisitRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeVisit()),
    findBySellerId: vi.fn().mockResolvedValue([]),
    findBySellerIds: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(makeVisit()),
    update: vi.fn().mockResolvedValue(makeVisit()),
    ...overrides,
  } as unknown as VisitRepository;
}

function makeSubordinate(overrides?: Partial<EmployeeRecord>): EmployeeRecord {
  return {
    id: "emp-1",
    employeeCode: 1,
    firstName: "Juan",
    lastName: "Pérez",
    levelId: 1,
    supervisorId: "sup-1",
    isActive: true,
    ...overrides,
  } as EmployeeRecord;
}

function makeOrganizationRepo(
  subordinates: readonly EmployeeRecord[],
): OrganizationRepository {
  return {
    getDirectSubordinates: vi.fn().mockResolvedValue(subordinates),
  } as unknown as OrganizationRepository;
}

function makeClientRepo(client: Client | null): ClientRepository {
  return { findById: vi.fn().mockResolvedValue(client) } as unknown as ClientRepository;
}

// =============================================================================
// CreateVisitUseCase
// =============================================================================

describe("CreateVisitUseCase — negative authorization", () => {
  it("throws AuthorizationError and never creates the visit when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("visit.create"),
    );
    const visitRepository = makeVisitRepo();
    const useCase = new CreateVisitUseCase(
      service,
      visitRepository,
      makeOrganizationRepo([]),
      makeClientRepo(makeClient()),
    );

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        sellerId: "emp-1",
        clientId: "client-1",
        scheduledDate: new Date(2026, 3, 10, 10),
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "visit.create",
    });
    expect(visitRepository.create).not.toHaveBeenCalled();
  });

  it("rejects assigning a visit to a seller outside the team", async () => {
    const { service } = makeAuthService(makeAllowDecision("visit.create"));
    const visitRepository = makeVisitRepo();
    const useCase = new CreateVisitUseCase(
      service,
      visitRepository,
      makeOrganizationRepo([makeSubordinate()]),
      makeClientRepo(makeClient()),
    );

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        sellerId: "emp-foreign",
        clientId: "client-1",
        scheduledDate: new Date(2026, 3, 10, 10),
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(visitRepository.create).not.toHaveBeenCalled();
  });

  it("creates the visit for a seller of the team", async () => {
    const { service } = makeAuthService(makeAllowDecision("visit.create"));
    const visitRepository = makeVisitRepo();
    const useCase = new CreateVisitUseCase(
      service,
      visitRepository,
      makeOrganizationRepo([makeSubordinate()]),
      makeClientRepo(makeClient()),
    );

    const visit = await useCase.execute({
      authContext: makeAuthContext(),
      sellerId: "emp-1",
      clientId: "client-1",
      scheduledDate: new Date(2026, 3, 10, 10),
      notes: "Primera visita",
    });

    expect(visit.id).toBe("visit-1");
    expect(visitRepository.create).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// UpdateVisitUseCase
// =============================================================================

describe("UpdateVisitUseCase — negative authorization", () => {
  it("throws AuthorizationError and never reads the visit when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("visit.update"),
    );
    const visitRepository = makeVisitRepo();
    const useCase = new UpdateVisitUseCase(service, visitRepository);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ employeeId: "emp-1" }),
        visitId: "visit-1",
        status: "COMPLETED" as VisitStatus,
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext({ employeeId: "emp-1" }), {
      permission: "visit.update",
    });
    expect(visitRepository.findById).not.toHaveBeenCalled();
    expect(visitRepository.update).not.toHaveBeenCalled();
  });

  it("rejects updating a visit that belongs to another seller", async () => {
    const { service } = makeAuthService(makeAllowDecision("visit.update"));
    const visitRepository = makeVisitRepo({
      findById: vi.fn().mockResolvedValue(makeVisit({ sellerId: "emp-other" })),
    });
    const useCase = new UpdateVisitUseCase(service, visitRepository);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ employeeId: "emp-1" }),
        visitId: "visit-1",
        status: "CANCELLED" as VisitStatus,
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(visitRepository.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// GetVisitListUseCase
// =============================================================================

describe("GetVisitListUseCase — negative authorization", () => {
  it("throws AuthorizationError and never lists visits when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("visit.view"),
    );
    const visitRepository = makeVisitRepo();
    const useCase = new GetVisitListUseCase(service, visitRepository);

    await expect(
      useCase.execute({ authContext: makeAuthContext() }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "visit.view",
    });
    expect(visitRepository.findBySellerId).not.toHaveBeenCalled();
  });

  it("requires the team scope to be resolvable", async () => {
    const { service } = makeAuthService(makeAllowDecision("visit.view"));
    const visitRepository = makeVisitRepo();
    // No organization repository injected: the team cannot be resolved.
    const useCase = new GetVisitListUseCase(service, visitRepository);

    await expect(
      useCase.execute({ authContext: makeAuthContext(), scope: "TEAM" }),
    ).rejects.toThrow(AuthorizationError);

    expect(visitRepository.findBySellerIds).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CreateClientUseCase
// =============================================================================

describe("CreateClientUseCase — negative authorization", () => {
  it("throws AuthorizationError and never creates the client when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("client.create"),
    );
    const clientRepository = {
      create: vi.fn().mockResolvedValue(makeClient()),
      findByOwnerId: vi.fn().mockResolvedValue([]),
    } as unknown as ClientRepository;
    const useCase = new CreateClientUseCase(service, clientRepository);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        name: "Ana Gómez",
        address: "Av. Siempreviva 742",
        street: "Av. Siempreviva",
        streetNumber: "742",
        city: "Córdoba",
        province: "Córdoba",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "client.create",
    });
    expect(clientRepository.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// GetClientListUseCase
// =============================================================================

describe("GetClientListUseCase — negative authorization", () => {
  it("throws AuthorizationError and never lists clients when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("client.view"),
    );
    const clientRepository = {
      create: vi.fn(),
      findByOwnerId: vi.fn().mockResolvedValue([makeClient()]),
    } as unknown as ClientRepository;
    const useCase = new GetClientListUseCase(service, clientRepository);

    await expect(
      useCase.execute({ authContext: makeAuthContext() }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "client.view",
    });
    expect(clientRepository.findByOwnerId).not.toHaveBeenCalled();
  });
});

// =============================================================================
// GetTeamListUseCase
// =============================================================================

describe("GetTeamListUseCase — negative authorization", () => {
  it("throws AuthorizationError and never reads subordinates when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("employee.read"),
    );
    const organizationRepository = makeOrganizationRepo([makeSubordinate()]);
    const useCase = new GetTeamListUseCase(service, organizationRepository);

    await expect(
      useCase.execute({ authContext: makeAuthContext() }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "employee.read",
    });
    expect(
      organizationRepository.getDirectSubordinates,
    ).not.toHaveBeenCalled();
  });
});
