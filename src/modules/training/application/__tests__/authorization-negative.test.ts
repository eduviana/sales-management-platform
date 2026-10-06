/**
 * Negative authorization tests for the training module (P3, ADR-020 roadmap).
 *
 * Training mutations are ADMIN-only: a denied decision must abort the
 * operation before any repository access.
 *
 * Reference: permissions-matrix.md §4.13
 */

import { describe, it, expect, vi } from "vitest";
import { UpdateTrainingModuleUseCase } from "../update-training-module-use-case";
import { DeleteTrainingCategoryUseCase } from "../delete-training-category-use-case";
import { CreateTrainingCategoryUseCase } from "../create-training-category-use-case";
import { CreateTrainingCourseUseCase } from "../create-training-course-use-case";
import { CreateTrainingMaterialUseCase } from "../create-training-material-use-case";
import { CreateTrainingModuleUseCase } from "../create-training-module-use-case";
import { DeleteTrainingCourseUseCase } from "../delete-training-course-use-case";
import { DeleteTrainingMaterialUseCase } from "../delete-training-material-use-case";
import { DeleteTrainingModuleUseCase } from "../delete-training-module-use-case";
import { UpdateTrainingCategoryUseCase } from "../update-training-category-use-case";
import { UpdateTrainingCourseUseCase } from "../update-training-course-use-case";
import { UpdateTrainingMaterialUseCase } from "../update-training-material-use-case";
import { ArchiveTrainingContentUseCase } from "../archive-training-content-use-case";
import { PublishTrainingContentUseCase } from "../publish-training-content-use-case";
import { AuthorizationError, NotFoundError } from "@/shared/errors";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import type {
  TrainingCourseRepository,
  TrainingMaterialRepository,
  TrainingModuleRepository,
  TrainingCategoryRepository,
} from "@/modules/training/domain";

// =============================================================================
// Helpers
// =============================================================================

function makeAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: null,
    role: "SELLER",
    supervisorId: null,
    userEmail: "seller@example.com",
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

function makeModuleRepo(): TrainingModuleRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as TrainingModuleRepository;
}

function makeCategoryRepo(): TrainingCategoryRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as TrainingCategoryRepository;
}

function makeCourseRepo(): TrainingCourseRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as TrainingCourseRepository;
}

function makeMaterialRepo(): TrainingMaterialRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as TrainingMaterialRepository;
}

// =============================================================================
// UpdateTrainingModuleUseCase
// =============================================================================

describe("UpdateTrainingModuleUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the module when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.update"),
    );
    const moduleRepo = makeModuleRepo();
    const useCase = new UpdateTrainingModuleUseCase(service, moduleRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        moduleId: "mod-1",
        name: "Nuevo nombre",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.update",
    });
    expect(moduleRepo.findById).not.toHaveBeenCalled();
    expect(moduleRepo.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// DeleteTrainingCategoryUseCase
// =============================================================================

describe("DeleteTrainingCategoryUseCase — negative authorization", () => {
  it("throws AuthorizationError and never deletes the category when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.delete"),
    );
    const categoryRepo = makeCategoryRepo();
    const useCase = new DeleteTrainingCategoryUseCase(service, categoryRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        categoryId: "cat-1",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.delete",
    });
    expect(categoryRepo.findById).not.toHaveBeenCalled();
    expect(categoryRepo.delete).not.toHaveBeenCalled();
  });

  it("checks existence only after the permission is granted", async () => {
    const { service } = makeAuthService(makeAllowDecision("training.delete"));
    const categoryRepo = makeCategoryRepo();
    const useCase = new DeleteTrainingCategoryUseCase(service, categoryRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ role: "ADMIN" }),
        categoryId: "cat-missing",
      }),
    ).rejects.toThrow(NotFoundError);

    expect(categoryRepo.findById).toHaveBeenCalledTimes(1);
    expect(categoryRepo.delete).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CreateTrainingCategoryUseCase
// =============================================================================

describe("CreateTrainingCategoryUseCase — negative authorization", () => {
  it("throws AuthorizationError and never creates the category when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.create"),
    );
    const categoryRepo = makeCategoryRepo();
    const useCase = new CreateTrainingCategoryUseCase(service, categoryRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        name: "Nueva categoría",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.create",
    });
    expect(categoryRepo.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CreateTrainingCourseUseCase
// =============================================================================

describe("CreateTrainingCourseUseCase — negative authorization", () => {
  it("throws AuthorizationError and never creates the course when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.create"),
    );
    const courseRepo = makeCourseRepo();
    const useCase = new CreateTrainingCourseUseCase(service, courseRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        categoryId: "cat-1",
        name: "Nuevo curso",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.create",
    });
    expect(courseRepo.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CreateTrainingMaterialUseCase
// =============================================================================

describe("CreateTrainingMaterialUseCase — negative authorization", () => {
  it("throws AuthorizationError and never creates the material when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.create"),
    );
    const materialRepo = makeMaterialRepo();
    const useCase = new CreateTrainingMaterialUseCase(service, materialRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        moduleId: "mod-1",
        name: "Nuevo material",
        type: "PDF",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.create",
    });
    expect(materialRepo.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CreateTrainingModuleUseCase
// =============================================================================

describe("CreateTrainingModuleUseCase — negative authorization", () => {
  it("throws AuthorizationError and never creates the module when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.create"),
    );
    const moduleRepo = makeModuleRepo();
    const useCase = new CreateTrainingModuleUseCase(service, moduleRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        courseId: "course-1",
        name: "Nuevo módulo",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.create",
    });
    expect(moduleRepo.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// DeleteTrainingCourseUseCase
// =============================================================================

describe("DeleteTrainingCourseUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the course when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.delete"),
    );
    const courseRepo = makeCourseRepo();
    const useCase = new DeleteTrainingCourseUseCase(service, courseRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        courseId: "course-1",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.delete",
    });
    expect(courseRepo.findById).not.toHaveBeenCalled();
    expect(courseRepo.delete).not.toHaveBeenCalled();
  });
});

// =============================================================================
// DeleteTrainingMaterialUseCase
// =============================================================================

describe("DeleteTrainingMaterialUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the material when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.delete"),
    );
    const materialRepo = makeMaterialRepo();
    const useCase = new DeleteTrainingMaterialUseCase(service, materialRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        materialId: "mat-1",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.delete",
    });
    expect(materialRepo.findById).not.toHaveBeenCalled();
    expect(materialRepo.delete).not.toHaveBeenCalled();
  });
});

// =============================================================================
// DeleteTrainingModuleUseCase
// =============================================================================

describe("DeleteTrainingModuleUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the module when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.delete"),
    );
    const moduleRepo = makeModuleRepo();
    const useCase = new DeleteTrainingModuleUseCase(service, moduleRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        moduleId: "mod-1",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.delete",
    });
    expect(moduleRepo.findById).not.toHaveBeenCalled();
    expect(moduleRepo.delete).not.toHaveBeenCalled();
  });
});

// =============================================================================
// UpdateTrainingCategoryUseCase
// =============================================================================

describe("UpdateTrainingCategoryUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the category when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.update"),
    );
    const categoryRepo = makeCategoryRepo();
    const useCase = new UpdateTrainingCategoryUseCase(service, categoryRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        categoryId: "cat-1",
        name: "Categoría editada",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.update",
    });
    expect(categoryRepo.findById).not.toHaveBeenCalled();
    expect(categoryRepo.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// UpdateTrainingCourseUseCase
// =============================================================================

describe("UpdateTrainingCourseUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the course when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.update"),
    );
    const courseRepo = makeCourseRepo();
    const useCase = new UpdateTrainingCourseUseCase(service, courseRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        courseId: "course-1",
        name: "Curso editado",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.update",
    });
    expect(courseRepo.findById).not.toHaveBeenCalled();
    expect(courseRepo.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// UpdateTrainingMaterialUseCase
// =============================================================================

describe("UpdateTrainingMaterialUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the material when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.update"),
    );
    const materialRepo = makeMaterialRepo();
    const useCase = new UpdateTrainingMaterialUseCase(service, materialRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        materialId: "mat-1",
        name: "Material editado",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.update",
    });
    expect(materialRepo.findById).not.toHaveBeenCalled();
    expect(materialRepo.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// ArchiveTrainingContentUseCase
// =============================================================================

describe("ArchiveTrainingContentUseCase — negative authorization", () => {
  it("throws AuthorizationError and never reads the content when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.publish"),
    );
    const courseRepo = makeCourseRepo();
    const materialRepo = makeMaterialRepo();
    const useCase = new ArchiveTrainingContentUseCase(
      service,
      courseRepo,
      materialRepo,
    );

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        contentType: "course",
        contentId: "course-1",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.publish",
    });
    expect(courseRepo.findById).not.toHaveBeenCalled();
    expect(materialRepo.findById).not.toHaveBeenCalled();
  });
});

// =============================================================================
// PublishTrainingContentUseCase
// =============================================================================

describe("PublishTrainingContentUseCase — negative authorization", () => {
  it("throws AuthorizationError and never reads the content when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("training.publish"),
    );
    const courseRepo = makeCourseRepo();
    const materialRepo = makeMaterialRepo();
    const useCase = new PublishTrainingContentUseCase(
      service,
      courseRepo,
      materialRepo,
    );

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        contentType: "material",
        contentId: "mat-1",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "training.publish",
    });
    expect(courseRepo.findById).not.toHaveBeenCalled();
    expect(materialRepo.findById).not.toHaveBeenCalled();
  });
});
