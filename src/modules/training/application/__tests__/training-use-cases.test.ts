import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListTrainingCategoriesUseCase } from "../list-training-categories-use-case";
import { GetTrainingCategoryUseCase } from "../get-training-category-use-case";
import { GetTrainingCourseUseCase } from "../get-training-course-use-case";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type {
  TrainingCategoryRepository,
  TrainingCourseRepository,
  TrainingModuleRepository,
  TrainingMaterialRepository,
} from "../../domain";

function makeAuthContext(overrides?: Record<string, unknown>) {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: 1,
    role: "SELLER" as const,
    supervisorId: null,
    userEmail: "seller@example.com",
    ...overrides,
  };
}

function makeAdminContext() {
  return makeAuthContext({ role: "ADMIN" as const, levelId: null });
}

function makeAllowAuth(): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue({ allowed: true, permission: "training.read" }),
  };
}

function makeDenyAuth(): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue({ allowed: false, permission: "training.read", reason: "Denied" }),
  };
}

const mockCategory = {
  id: "cat-1",
  name: "Categoría Test",
  description: "Descripción test",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCourse = {
  id: "course-1",
  categoryId: "cat-1",
  name: "Curso Test",
  description: "Descripción curso",
  status: "PUBLISHED" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockModule = {
  id: "mod-1",
  courseId: "course-1",
  name: "Módulo Test",
  description: "Descripción módulo",
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMaterial = {
  id: "mat-1",
  moduleId: "mod-1",
  name: "Material Test",
  description: "Descripción material",
  type: "PDF" as const,
  url: "https://example.com/test.pdf",
  levelId: 1,
  status: "PUBLISHED" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeCategoryRepo(overrides?: Partial<TrainingCategoryRepository>): TrainingCategoryRepository {
  return {
    findById: vi.fn().mockResolvedValue(mockCategory),
    findAll: vi.fn().mockResolvedValue([mockCategory]),
    create: vi.fn().mockResolvedValue(mockCategory),
    update: vi.fn().mockResolvedValue(mockCategory),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeCourseRepo(overrides?: Partial<TrainingCourseRepository>): TrainingCourseRepository {
  return {
    findById: vi.fn().mockResolvedValue(mockCourse),
    findByCategoryId: vi.fn().mockResolvedValue([mockCourse]),
    findByCategoryIdAndStatus: vi.fn().mockResolvedValue([mockCourse]),
    create: vi.fn().mockResolvedValue(mockCourse),
    update: vi.fn().mockResolvedValue(mockCourse),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMaterialRepo(overrides?: Partial<TrainingMaterialRepository>): TrainingMaterialRepository {
  return {
    findById: vi.fn().mockResolvedValue(mockMaterial),
    findByModuleId: vi.fn().mockResolvedValue([mockMaterial]),
    findAccessibleByLevel: vi.fn().mockResolvedValue([mockMaterial]),
    findAll: vi.fn().mockResolvedValue([mockMaterial]),
    create: vi.fn().mockResolvedValue(mockMaterial),
    update: vi.fn().mockResolvedValue(mockMaterial),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("ListTrainingCategoriesUseCase", () => {
  let auth: AuthorizationService;
  let categoryRepo: TrainingCategoryRepository;
  let courseRepo: TrainingCourseRepository;
  let useCase: ListTrainingCategoriesUseCase;

  beforeEach(() => {
    auth = makeAllowAuth();
    categoryRepo = makeCategoryRepo();
    courseRepo = makeCourseRepo();
    useCase = new ListTrainingCategoriesUseCase(auth, categoryRepo, courseRepo);
  });

  it("returns categories with published courses", async () => {
    const result = await useCase.execute({ authContext: makeAuthContext() });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Categoría Test");
    expect(result[0].courseCount).toBe(1);
  });

  it("returns empty when not authorized", async () => {
    const denyAuth = makeDenyAuth();
    const denyUseCase = new ListTrainingCategoriesUseCase(denyAuth, categoryRepo, courseRepo);
    const result = await denyUseCase.execute({ authContext: makeAuthContext() });
    expect(result).toHaveLength(0);
  });

  it("returns all categories for ADMIN", async () => {
    const result = await useCase.execute({ authContext: makeAdminContext() });
    expect(result).toHaveLength(1);
    expect(courseRepo.findByCategoryId).toHaveBeenCalled();
  });

  it("returns empty when no courses exist", async () => {
    const emptyCourseRepo = makeCourseRepo({
      findByCategoryIdAndStatus: vi.fn().mockResolvedValue([]),
    });
    const emptyUseCase = new ListTrainingCategoriesUseCase(auth, categoryRepo, emptyCourseRepo);
    const result = await emptyUseCase.execute({ authContext: makeAuthContext() });
    expect(result).toHaveLength(0);
  });
});

describe("GetTrainingCategoryUseCase", () => {
  let auth: AuthorizationService;
  let categoryRepo: TrainingCategoryRepository;
  let courseRepo: TrainingCourseRepository;
  let useCase: GetTrainingCategoryUseCase;

  beforeEach(() => {
    auth = makeAllowAuth();
    categoryRepo = makeCategoryRepo();
    courseRepo = makeCourseRepo();
    useCase = new GetTrainingCategoryUseCase(auth, categoryRepo, courseRepo);
  });

  it("returns category with courses", async () => {
    const result = await useCase.execute({
      authContext: makeAuthContext(),
      categoryId: "cat-1",
    });
    expect(result.category.name).toBe("Categoría Test");
    expect(result.courses).toHaveLength(1);
  });

  it("throws when category not found", async () => {
    const notFoundRepo = makeCategoryRepo({
      findById: vi.fn().mockResolvedValue(null),
    });
    const notFoundUseCase = new GetTrainingCategoryUseCase(auth, notFoundRepo, courseRepo);
    await expect(
      notFoundUseCase.execute({ authContext: makeAuthContext(), categoryId: "nonexistent" }),
    ).rejects.toThrow("not found");
  });

  it("filters by status for non-ADMIN", async () => {
    await useCase.execute({ authContext: makeAuthContext(), categoryId: "cat-1" });
    expect(courseRepo.findByCategoryIdAndStatus).toHaveBeenCalledWith("cat-1", "PUBLISHED");
  });
});

describe("GetTrainingCourseUseCase", () => {
  let auth: AuthorizationService;
  let courseRepo: TrainingCourseRepository;
  let moduleRepo: TrainingModuleRepository;
  let materialRepo: TrainingMaterialRepository;
  let useCase: GetTrainingCourseUseCase;

  beforeEach(() => {
    auth = makeAllowAuth();
    courseRepo = makeCourseRepo();
    moduleRepo = {
      findById: vi.fn().mockResolvedValue(mockModule),
      findByCourseId: vi.fn().mockResolvedValue([mockModule]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    materialRepo = makeMaterialRepo();
    useCase = new GetTrainingCourseUseCase(auth, courseRepo, moduleRepo, materialRepo);
  });

  it("returns course with modules and materials", async () => {
    const result = await useCase.execute({
      authContext: makeAuthContext(),
      courseId: "course-1",
    });
    expect(result.course.name).toBe("Curso Test");
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].materials).toHaveLength(1);
  });

  it("filters materials by level for non-ADMIN", async () => {
    await useCase.execute({ authContext: makeAuthContext({ levelId: 1 }), courseId: "course-1" });
    expect(materialRepo.findAccessibleByLevel).toHaveBeenCalledWith(1, {
      moduleId: "mod-1",
      status: "PUBLISHED",
    });
  });

  it("returns all materials for ADMIN", async () => {
    await useCase.execute({ authContext: makeAdminContext(), courseId: "course-1" });
    expect(materialRepo.findAll).toHaveBeenCalledWith({ moduleId: "mod-1" });
  });
});
