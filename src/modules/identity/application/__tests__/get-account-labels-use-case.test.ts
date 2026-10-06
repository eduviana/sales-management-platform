import { describe, it, expect, vi } from "vitest";
import { GetAccountLabelsUseCase } from "../get-account-labels-use-case";
import type { IdentityRepository } from "../../domain/identity-repository";

function makeIdentityRepository(
  findAccountEmailsByIds: ReturnType<typeof vi.fn>,
): IdentityRepository {
  return {
    findAccountEmailsByIds,
  } as unknown as IdentityRepository;
}

describe("GetAccountLabelsUseCase", () => {
  it("returns the account email per user id", async () => {
    const findAccountEmailsByIds = vi.fn().mockResolvedValue([
      { id: "user-1", email: "vendedor@example.com" },
      { id: "user-2", email: null },
    ]);
    const useCase = new GetAccountLabelsUseCase(
      makeIdentityRepository(findAccountEmailsByIds),
    );

    const labels = await useCase.execute({ userIds: ["user-1", "user-2"] });

    expect(findAccountEmailsByIds).toHaveBeenCalledWith(["user-1", "user-2"]);
    expect(labels.get("user-1")).toBe("vendedor@example.com");
    expect(labels.get("user-2")).toBe("Cuenta");
  });

  it("does not query when there are no ids", async () => {
    const findAccountEmailsByIds = vi.fn().mockResolvedValue([]);
    const useCase = new GetAccountLabelsUseCase(
      makeIdentityRepository(findAccountEmailsByIds),
    );

    const labels = await useCase.execute({ userIds: [] });

    expect(labels.size).toBe(0);
    expect(findAccountEmailsByIds).not.toHaveBeenCalled();
  });
});
