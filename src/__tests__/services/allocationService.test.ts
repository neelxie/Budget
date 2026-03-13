import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  resetStorage,
} from "../../services/allocationService";
import { mockAllocations, newFormData } from "../fixtures";

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function tick() {
  vi.runAllTimers();
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

describe("getAllocations", () => {
  it("returns seed data when localStorage is empty", async () => {
    const p = getAllocations();
    await tick();
    const result = await p;
    expect(result.length).toBeGreaterThan(0);
  });
  it("returns stored data when localStorage has valid data", async () => {
    localStorage.setItem("budget_allocations", JSON.stringify(mockAllocations));
    const p = getAllocations();
    await tick();
    expect(await p).toEqual(mockAllocations);
  });
  it("falls back to seed data on invalid JSON", async () => {
    localStorage.setItem("budget_allocations", "{{bad}}");
    const p = getAllocations();
    await tick();
    expect(Array.isArray(await p)).toBe(true);
  });
});

describe("createAllocation", () => {
  beforeEach(() => {
    localStorage.setItem("budget_allocations", JSON.stringify(mockAllocations));
  });
  it("returns new allocation with auto-generated id", async () => {
    const p = createAllocation(newFormData);
    await tick();
    const created = await p;
    expect(created.id).toBe(5);
    expect(created.village).toBe(newFormData.village);
  });
  it("persists the new record to localStorage", async () => {
    const p = createAllocation(newFormData);
    await tick();
    await p;
    const stored: unknown[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored).toHaveLength(mockAllocations.length + 1);
  });
});

describe("updateAllocation", () => {
  beforeEach(() => {
    localStorage.setItem("budget_allocations", JSON.stringify(mockAllocations));
  });
  it("returns allocation with updated values", async () => {
    const p = updateAllocation(1, { ...newFormData, village: "Updated" });
    await tick();
    const result = await p;
    expect(result.village).toBe("Updated");
    expect(result.id).toBe(1);
  });
  it("persists the change to localStorage", async () => {
    const p = updateAllocation(1, { ...newFormData, village: "Mutated" });
    await tick();
    await p;
    const stored: any[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored.find((a) => a.id === 1).village).toBe("Mutated");
  });
  it("does not change the total record count", async () => {
    const p = updateAllocation(2, newFormData);
    await tick();
    await p;
    const stored: unknown[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored).toHaveLength(mockAllocations.length);
  });
  it("rejects when id does not exist", async () => {
    const p = updateAllocation(999, newFormData);
    await tick();
    await expect(p).rejects.toThrow("Allocation 999 not found");
  });
});

describe("deleteAllocation", () => {
  beforeEach(() => {
    localStorage.setItem("budget_allocations", JSON.stringify(mockAllocations));
  });
  it("removes the record from localStorage", async () => {
    const p = deleteAllocation(1);
    await tick();
    await p;
    const stored: any[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored.find((a) => a.id === 1)).toBeUndefined();
  });
  it("reduces count by 1", async () => {
    const p = deleteAllocation(2);
    await tick();
    await p;
    const stored: unknown[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored).toHaveLength(mockAllocations.length - 1);
  });
  it("does nothing when id does not exist", async () => {
    const p = deleteAllocation(9999);
    await tick();
    await p;
    const stored: unknown[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored).toHaveLength(mockAllocations.length);
  });
});

describe("resetStorage", () => {
  it("replaces custom data with seed records", () => {
    localStorage.setItem("budget_allocations", JSON.stringify([]));
    resetStorage();
    const stored: unknown[] = JSON.parse(
      localStorage.getItem("budget_allocations")!,
    );
    expect(stored.length).toBeGreaterThan(0);
  });
});
