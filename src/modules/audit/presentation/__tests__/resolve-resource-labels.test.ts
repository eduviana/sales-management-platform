import { describe, it, expect, vi } from "vitest";
import {
  resolveResourceLabels,
  type ResourceLabelResolvers,
} from "../resolve-resource-labels";

function makeEvent(
  overrides?: Partial<{
    id: string;
    resourceType: string;
    resourceId: string | null;
  }>,
) {
  return {
    id: "event-1",
    resourceType: "Employee",
    resourceId: "emp-1",
    ...overrides,
  };
}

describe("resolveResourceLabels", () => {
  it("returns an empty map when there are no events", async () => {
    const resolvers: ResourceLabelResolvers = {
      Employee: vi.fn().mockResolvedValue(new Map()),
    };

    const labels = await resolveResourceLabels([], resolvers);

    expect(labels.size).toBe(0);
    expect(resolvers.Employee).not.toHaveBeenCalled();
  });

  it("groups ids by resource type and merges the labels", async () => {
    const employeeResolver = vi.fn().mockResolvedValue(
      new Map([
        ["emp-1", "EMP-7"],
        ["emp-2", "EMP-9"],
      ]),
    );
    const saleResolver = vi.fn().mockResolvedValue(
      new Map([["sale-1", "VT-0042"]]),
    );
    const resolvers: ResourceLabelResolvers = {
      Employee: employeeResolver,
      Sale: saleResolver,
    };

    const labels = await resolveResourceLabels(
      [
        makeEvent(),
        makeEvent({ id: "event-2", resourceId: "emp-2" }),
        makeEvent({ id: "event-3", resourceType: "Sale", resourceId: "sale-1" }),
      ],
      resolvers,
    );

    expect(employeeResolver).toHaveBeenCalledWith(["emp-1", "emp-2"]);
    expect(saleResolver).toHaveBeenCalledWith(["sale-1"]);
    expect(labels.get("emp-1")).toBe("EMP-7");
    expect(labels.get("emp-2")).toBe("EMP-9");
    expect(labels.get("sale-1")).toBe("VT-0042");
  });

  it("skips events without a resource id", async () => {
    const employeeResolver = vi.fn().mockResolvedValue(new Map());
    const resolvers: ResourceLabelResolvers = {
      Employee: employeeResolver,
    };

    const labels = await resolveResourceLabels(
      [makeEvent({ resourceId: null })],
      resolvers,
    );

    expect(employeeResolver).not.toHaveBeenCalled();
    expect(labels.size).toBe(0);
  });

  it("does not label resource types without a resolver", async () => {
    const labels = await resolveResourceLabels(
      [makeEvent({ resourceType: "Unknown" })],
      {},
    );

    expect(labels.size).toBe(0);
  });

  it("leaves resources that the resolver does not return unlabeled", async () => {
    const resolvers: ResourceLabelResolvers = {
      Employee: vi.fn().mockResolvedValue(new Map()),
    };

    const labels = await resolveResourceLabels([makeEvent()], resolvers);

    expect(labels.has("emp-1")).toBe(false);
  });
});
