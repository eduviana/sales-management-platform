/**
 * Progression use case tests.
 *
 * The use cases read sales, visits and level history through the owning
 * modules' ports, so every test drives the calculation through those ports.
 *
 * Reference: business-rules.md REG-082, ADR-020
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CalculateProgressionUseCase } from "../calculate-progression-use-case";
import { GetEmployeeProgressionUseCase } from "../get-employee-progression-use-case";
import type { ProgressEntry } from "@/modules/progression/domain";
import type { ProgressionRepository } from "@/modules/progression/domain/progression-repository";
import type {
  LevelHistoryRecord,
  OrganizationRepository,
} from "@/modules/organization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { VisitRepository } from "@/modules/visits/domain";

// =============================================================================
// Helpers
// =============================================================================

function makeEntry(
  overrides: Partial<ProgressEntry> & Pick<ProgressEntry, "type" | "points">,
): ProgressEntry {
  return {
    id: `entry-${Math.random().toString(36).slice(2)}`,
    employeeId: "emp-1",
    description: null,
    period: null,
    createdAt: new Date(2026, 0, 15),
    ...overrides,
  };
}

function makeLevelHistory(
  employeeId: string,
  startedAt: Date,
  levelId = 3,
): LevelHistoryRecord {
  return {
    id: `history-${employeeId}`,
    employeeId,
    levelId,
    startedAt,
    endedAt: null,
    reason: null,
    createdAt: startedAt,
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
    ...overrides,
  } as unknown as SaleRepository;
}

function makeVisitRepo(
  overrides?: Partial<VisitRepository>,
): VisitRepository {
  return {
    countCompletedBySellerIdSince: vi.fn().mockResolvedValue(0),
    countCompletedBySellerIdSinceBatch: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  } as unknown as VisitRepository;
}

// Fixed "now" so seniority months are deterministic. Dates are built with
// local components on purpose: the progression rules compare calendar months.
const NOW = new Date(2026, 3, 15, 12);

// =============================================================================
// GetEmployeeProgressionUseCase
// =============================================================================

describe("GetEmployeeProgressionUseCase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sums seniority, visits, sales and target bonuses", async () => {
    const progressionRepo = makeProgressionRepo({
      getEntriesByEmployee: vi.fn().mockResolvedValue([
        makeEntry({ type: "TARGET_ACHIEVED", points: 10 }),
        makeEntry({ type: "VISIT", points: 2 }),
      ]),
    });
    const orgRepo = makeOrgRepo({
      findOpenLevelHistory: vi
        .fn()
        .mockResolvedValue(makeLevelHistory("emp-1", new Date(2026, 0, 10))),
    });
    const saleRepo = makeSaleRepo({
      countApprovedSince: vi.fn().mockResolvedValue(4),
    });
    const visitRepo = makeVisitRepo({
      countCompletedBySellerIdSince: vi.fn().mockResolvedValue(5),
    });

    const uc = new GetEmployeeProgressionUseCase(
      progressionRepo,
      orgRepo,
      saleRepo,
      visitRepo,
    );

    const result = await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2020, 0, 1),
    });

    // 3 months seniority (Jan 10 -> Apr 15) * 1
    expect(result.breakdown.seniorityPoints).toBe(3);
    // 5 completed visits * 2
    expect(result.breakdown.visitPoints).toBe(10);
    // 4 approved sales * 5
    expect(result.breakdown.salePoints).toBe(20);
    // only TARGET_ACHIEVED entries count (the VISIT entry is ignored)
    expect(result.breakdown.targetPoints).toBe(10);
    expect(result.currentPoints).toBe(43);
  });

  it("measures progression from the start of the current level", async () => {
    const orgRepo = makeOrgRepo({
      findOpenLevelHistory: vi
        .fn()
        .mockResolvedValue(makeLevelHistory("emp-1", new Date(2026, 0, 10))),
    });
    const visitRepo = makeVisitRepo({
      countCompletedBySellerIdSince: vi.fn().mockResolvedValue(0),
    });
    const uc = new GetEmployeeProgressionUseCase(
      makeProgressionRepo(),
      orgRepo,
      makeSaleRepo(),
      visitRepo,
    );

    await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2015, 0, 1),
    });

    expect(visitRepo.countCompletedBySellerIdSince).toHaveBeenCalledWith(
      "emp-1",
      new Date(2026, 0, 10),
    );
  });

  it("falls back to joinedAt when the employee has no open level history", async () => {
    const joinedAt = new Date(2026, 2, 10);
    const orgRepo = makeOrgRepo({
      findOpenLevelHistory: vi.fn().mockResolvedValue(null),
    });
    const saleRepo = makeSaleRepo();
    const uc = new GetEmployeeProgressionUseCase(
      makeProgressionRepo(),
      orgRepo,
      saleRepo,
      makeVisitRepo(),
    );

    await uc.execute({ employeeId: "emp-1", currentLevelId: 3, joinedAt });

    expect(saleRepo.countApprovedSince).toHaveBeenCalledWith(
      "emp-1",
      joinedAt,
    );
  });

  it("ignores target bonuses recorded before the current level started", async () => {
    const levelStart = new Date(2026, 2, 1);
    const progressionRepo = makeProgressionRepo({
      getEntriesByEmployee: vi.fn().mockResolvedValue([
        makeEntry({
          type: "TARGET_ACHIEVED",
          points: 10,
          createdAt: new Date(2026, 1, 28),
        }),
        makeEntry({
          type: "TARGET_ACHIEVED",
          points: 10,
          createdAt: new Date(2026, 2, 5),
        }),
      ]),
    });
    const orgRepo = makeOrgRepo({
      findOpenLevelHistory: vi
        .fn()
        .mockResolvedValue(makeLevelHistory("emp-1", levelStart)),
    });
    const uc = new GetEmployeeProgressionUseCase(
      progressionRepo,
      orgRepo,
      makeSaleRepo(),
      makeVisitRepo(),
    );

    const result = await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2020, 0, 1),
    });

    expect(result.breakdown.targetPoints).toBe(10);
  });

  it("caps the percentage at 100 and returns zero points to next level at N7", async () => {
    const orgRepo = makeOrgRepo({
      findOpenLevelHistory: vi
        .fn()
        .mockResolvedValue(makeLevelHistory("emp-1", new Date(2020, 0, 1))),
    });
    const visitRepo = makeVisitRepo({
      countCompletedBySellerIdSince: vi.fn().mockResolvedValue(500),
    });

    const capped = new GetEmployeeProgressionUseCase(
      makeProgressionRepo(),
      orgRepo,
      makeSaleRepo(),
      visitRepo,
    );
    const cappedResult = await capped.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2020, 0, 1),
    });
    expect(cappedResult.percentage).toBe(100);
    expect(cappedResult.pointsToNextLevel).toBe(0);

    const maxLevel = new GetEmployeeProgressionUseCase(
      makeProgressionRepo(),
      orgRepo,
      makeSaleRepo(),
      visitRepo,
    );
    const maxLevelResult = await maxLevel.execute({
      employeeId: "emp-1",
      currentLevelId: 7,
      joinedAt: new Date(2020, 0, 1),
    });
    expect(maxLevelResult.percentage).toBe(0);
  });

  // ===========================================================================
  // executeBatch
  // ===========================================================================

  it("computes a summary per employee using each own level start", async () => {
    const orgRepo = makeOrgRepo({
      findOpenLevelHistories: vi.fn().mockResolvedValue([
        makeLevelHistory("emp-1", new Date(2026, 0, 10)),
        makeLevelHistory("emp-2", new Date(2026, 2, 1)),
      ]),
    });
    const visitRepo = makeVisitRepo({
      countCompletedBySellerIdSinceBatch: vi.fn().mockResolvedValue(
        new Map([
          ["emp-1", 2],
          ["emp-2", 4],
        ]),
      ),
    });
    const saleRepo = makeSaleRepo({
      countApprovedSinceByEmployee: vi.fn().mockResolvedValue(
        new Map([
          ["emp-1", 1],
          ["emp-2", 3],
        ]),
      ),
    });
    const progressionRepo = makeProgressionRepo({
      getEntriesByEmployees: vi.fn().mockResolvedValue([
        makeEntry({
          employeeId: "emp-1",
          type: "TARGET_ACHIEVED",
          points: 10,
          createdAt: new Date(2026, 1, 1),
        }),
      ]),
    });

    const uc = new GetEmployeeProgressionUseCase(
      progressionRepo,
      orgRepo,
      saleRepo,
      visitRepo,
    );

    const result = await uc.executeBatch([
      { id: "emp-1", currentLevelId: 3, joinedAt: new Date(2019, 0, 1) },
      { id: "emp-2", currentLevelId: 3, joinedAt: new Date(2019, 0, 1) },
    ]);

    // emp-1: 3 months + 2 visits * 2 + 1 sale * 5 + 10 target
    expect(result.get("emp-1")?.currentPoints).toBe(3 + 4 + 5 + 10);
    // emp-2: 1 month + 4 visits * 2 + 3 sales * 5 + 0 target
    expect(result.get("emp-2")?.currentPoints).toBe(1 + 8 + 15);
  });

  it("skips employees without a level in the batch summary", async () => {
    const visitRepo = makeVisitRepo({
      countCompletedBySellerIdSinceBatch: vi.fn().mockResolvedValue(new Map()),
    });
    const orgRepo = makeOrgRepo();
    const saleRepo = makeSaleRepo();
    const uc = new GetEmployeeProgressionUseCase(
      makeProgressionRepo(),
      orgRepo,
      saleRepo,
      visitRepo,
    );

    const result = await uc.executeBatch([
      { id: "admin", currentLevelId: null, joinedAt: new Date(2019, 0, 1) },
    ]);

    expect(result.size).toBe(0);
    expect(visitRepo.countCompletedBySellerIdSinceBatch).not.toHaveBeenCalled();
    expect(saleRepo.countApprovedSinceByEmployee).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CalculateProgressionUseCase
// =============================================================================

describe("CalculateProgressionUseCase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing for employees without a level (ADMIN)", async () => {
    const progressionRepo = makeProgressionRepo();
    const saleRepo = makeSaleRepo();
    const uc = new CalculateProgressionUseCase(
      progressionRepo,
      makeOrgRepo(),
      saleRepo,
    );

    await uc.execute({
      employeeId: "admin",
      currentLevelId: null,
      joinedAt: new Date(2020, 0, 1),
    });

    expect(saleRepo.getMonthlyTarget).not.toHaveBeenCalled();
    expect(progressionRepo.recordEntries).not.toHaveBeenCalled();
  });

  it("records a target bonus when the monthly target was reached", async () => {
    const progressionRepo = makeProgressionRepo({
      hasTargetBonus: vi.fn().mockResolvedValue(false),
    });
    const saleRepo = makeSaleRepo({
      getMonthlyTarget: vi.fn().mockResolvedValue(3),
      countApprovedInPeriod: vi.fn().mockResolvedValue(3),
    });
    const uc = new CalculateProgressionUseCase(
      progressionRepo,
      makeOrgRepo({
        findOpenLevelHistory: vi
          .fn()
          .mockResolvedValue(makeLevelHistory("emp-1", new Date(2026, 1, 1))),
      }),
      saleRepo,
    );

    await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2020, 0, 1),
    });

    expect(progressionRepo.recordEntries).toHaveBeenCalledOnce();
    const entries = vi.mocked(progressionRepo.recordEntries).mock.calls[0][0];
    // Months checked since the level start (Feb 2026): current and previous
    expect(entries.map((e) => e.period)).toEqual(["2026-04", "2026-03"]);
    for (const entry of entries) {
      expect(entry.type).toBe("TARGET_ACHIEVED");
      expect(entry.points).toBe(10);
    }
  });

  it("does not duplicate bonuses already recorded for the period", async () => {
    const progressionRepo = makeProgressionRepo({
      hasTargetBonus: vi.fn().mockResolvedValue(true),
    });
    const saleRepo = makeSaleRepo({
      getMonthlyTarget: vi.fn().mockResolvedValue(1),
      countApprovedInPeriod: vi.fn().mockResolvedValue(1),
    });
    const uc = new CalculateProgressionUseCase(
      progressionRepo,
      makeOrgRepo({
        findOpenLevelHistory: vi
          .fn()
          .mockResolvedValue(makeLevelHistory("emp-1", new Date(2026, 1, 1))),
      }),
      saleRepo,
    );

    await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2020, 0, 1),
    });

    expect(progressionRepo.recordEntries).not.toHaveBeenCalled();
  });

  it("does not record bonuses when no monthly target is configured", async () => {
    const progressionRepo = makeProgressionRepo();
    const saleRepo = makeSaleRepo({
      getMonthlyTarget: vi.fn().mockResolvedValue(0),
      countApprovedInPeriod: vi.fn().mockResolvedValue(10),
    });
    const uc = new CalculateProgressionUseCase(
      progressionRepo,
      makeOrgRepo({
        findOpenLevelHistory: vi
          .fn()
          .mockResolvedValue(makeLevelHistory("emp-1", new Date(2026, 2, 1))),
      }),
      saleRepo,
    );

    await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2020, 0, 1),
    });

    expect(progressionRepo.recordEntries).not.toHaveBeenCalled();
  });

  it("checks at most twelve months back", async () => {
    const progressionRepo = makeProgressionRepo({
      hasTargetBonus: vi.fn().mockResolvedValue(true),
    });
    const saleRepo = makeSaleRepo({
      getMonthlyTarget: vi.fn().mockResolvedValue(0),
    });
    const uc = new CalculateProgressionUseCase(
      progressionRepo,
      makeOrgRepo({
        findOpenLevelHistory: vi
          .fn()
          .mockResolvedValue(makeLevelHistory("emp-1", new Date(2015, 0, 1))),
      }),
      saleRepo,
    );

    await uc.execute({
      employeeId: "emp-1",
      currentLevelId: 3,
      joinedAt: new Date(2015, 0, 1),
    });

    expect(progressionRepo.hasTargetBonus).toHaveBeenCalledTimes(12);
  });
});