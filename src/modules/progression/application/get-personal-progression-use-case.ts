/**
 * Get personal progression overview use case.
 *
 * Builds the timeline shown to a seller in "Mi progreso": seniority months,
 * performed visits, approved sales and monthly target bonuses.
 *
 * Seniority is measured from `joinedAt` (personal scope), which is what the
 * timeline has always shown; the level-based measurement of
 * `GetEmployeeProgressionUseCase` is used for promotion readiness.
 *
 * Reference: requirements.md §3.13, business-rules.md REG-082
 */

import type {
  ProgressionActivityEntry,
  PersonalProgressionOverview,
} from "../domain";
import { POINT_VALUES, getThresholdForLevel } from "../domain";
import type { ProgressionRepository } from "../domain/progression-repository";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { VisitRepository } from "@/modules/visits/domain";

export interface GetPersonalProgressionInput {
  readonly employeeId: string;
}

export class GetPersonalProgressionUseCase {
  constructor(
    private readonly progressionRepository: ProgressionRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly saleRepository: SaleRepository,
    private readonly visitRepository: VisitRepository,
  ) {}

  /** Returns null when the employee record does not exist. */
  async execute(
    input: GetPersonalProgressionInput,
  ): Promise<PersonalProgressionOverview | null> {
    const employee = await this.organizationRepository.findEmployeeById(
      input.employeeId,
    );

    if (!employee) return null;

    const now = new Date();
    const [visits, sales, targetRecords] = await Promise.all([
      this.visitRepository.findBySellerId(employee.id),
      this.saleRepository.findApprovedByEmployeeId(employee.id),
      this.progressionRepository.getEntriesByEmployee(employee.id),
    ]);

    const seniorityEntries = buildSeniorityEntries(employee.joinedAt, now);

    const visitEntries: ProgressionActivityEntry[] = visits
      .filter((v) => v.status === "completed" || v.status === "no_sale")
      .map((v) => ({
        date: v.scheduledDate,
        type: "VISIT" as const,
        description: `Visita ${v.status === "completed" ? "completada" : "sin venta"} — ${v.clientName ?? ""}`,
        points: POINT_VALUES.VISIT,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const saleEntries: ProgressionActivityEntry[] = sales.map((s) => ({
      date: s.saleDate,
      type: "SALE" as const,
      description: `Venta aprobada VT-${String(s.saleNumber).padStart(4, "0")}${s.buyerName ? ` — ${s.buyerName}` : ""}`,
      points: POINT_VALUES.SALE,
    }));

    const targetEntries: ProgressionActivityEntry[] = targetRecords
      .filter((r) => r.type === "TARGET_ACHIEVED")
      .map((r) => ({
        date: r.createdAt,
        type: "TARGET" as const,
        description: `Objetivo mensual alcanzado — ${r.period ?? "sin período"}`,
        points: r.points,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      joinedAt: employee.joinedAt,
      threshold: getThresholdForLevel(employee.currentLevelId),
      entries: [
        ...seniorityEntries,
        ...visitEntries,
        ...saleEntries,
        ...targetEntries,
      ],
    };
  }
}

/** One entry per month worked, starting at joinedAt. */
function buildSeniorityEntries(
  joinedAt: Date,
  now: Date,
): ProgressionActivityEntry[] {
  const seniorityMonths = monthsBetween(joinedAt, now);
  const entries: ProgressionActivityEntry[] = [];
  for (let i = 0; i < seniorityMonths; i++) {
    const monthDate = new Date(joinedAt);
    monthDate.setMonth(monthDate.getMonth() + i);
    entries.push({
      date: monthDate,
      type: "SENIORITY",
      description: `Mes ${i + 1} en la empresa`,
      points: POINT_VALUES.SENIORITY,
    });
  }
  return entries;
}

function monthsBetween(from: Date, to: Date): number {
  const fromD = new Date(from);
  const toD = new Date(to);
  return (
    (toD.getFullYear() - fromD.getFullYear()) * 12 +
    (toD.getMonth() - fromD.getMonth())
  );
}