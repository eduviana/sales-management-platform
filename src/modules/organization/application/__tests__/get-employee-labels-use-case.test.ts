import { describe, it, expect, vi } from "vitest";
import { GetEmployeeLabelsUseCase } from "../get-employee-labels-use-case";
import type { OrganizationRepository } from "../../domain";

function makeOrganizationRepository(
  findEmployeeCodesByIds: ReturnType<typeof vi.fn>,
): OrganizationRepository {
  return {
    findEmployeeCodesByIds,
  } as unknown as OrganizationRepository;
}

describe("GetEmployeeLabelsUseCase", () => {
  it("returns EMP-<code> per employee id", async () => {
    const findEmployeeCodesByIds = vi.fn().mockResolvedValue([
      { id: "emp-1", employeeCode: 7 },
      { id: "emp-2", employeeCode: 42 },
    ]);
    const useCase = new GetEmployeeLabelsUseCase(
      makeOrganizationRepository(findEmployeeCodesByIds),
    );

    const labels = await useCase.execute({
      employeeIds: ["emp-1", "emp-2"],
    });

    expect(findEmployeeCodesByIds).toHaveBeenCalledWith(["emp-1", "emp-2"]);
    expect(labels.get("emp-1")).toBe("EMP-7");
    expect(labels.get("emp-2")).toBe("EMP-42");
  });

  it("omits employees that the repository does not return", async () => {
    const useCase = new GetEmployeeLabelsUseCase(
      makeOrganizationRepository(
        vi.fn().mockResolvedValue([{ id: "emp-1", employeeCode: 7 }]),
      ),
    );

    const labels = await useCase.execute({
      employeeIds: ["emp-1", "missing"],
    });

    expect(labels.has("emp-1")).toBe(true);
    expect(labels.has("missing")).toBe(false);
  });

  it("does not query when there are no ids", async () => {
    const findEmployeeCodesByIds = vi.fn().mockResolvedValue([]);
    const useCase = new GetEmployeeLabelsUseCase(
      makeOrganizationRepository(findEmployeeCodesByIds),
    );

    const labels = await useCase.execute({ employeeIds: [] });

    expect(labels.size).toBe(0);
    expect(findEmployeeCodesByIds).not.toHaveBeenCalled();
  });
});
