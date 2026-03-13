import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAllocations } from "../../hooks/useAllocations";
import * as service from "../../services/allocationService";
import { mockAllocations, newFormData } from "../fixtures";

vi.mock("../../services/allocationService");
const mockService = vi.mocked(service);

beforeEach(() => {
  vi.clearAllMocks();
  mockService.getAllocations.mockResolvedValue([...mockAllocations]);
  mockService.createAllocation.mockImplementation(async (data) => ({
    id: 99,
    ...data,
  }));
  mockService.updateAllocation.mockImplementation(async (id, data) => ({
    id,
    ...data,
  }));
  mockService.deleteAllocation.mockResolvedValue(undefined);
});

describe("initial load", () => {
  it("starts in loading state", () => {
    const { result } = renderHook(() => useAllocations());
    expect(result.current.isLoading).toBe(true);
  });
  it("loads allocations on mount", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.allocations).toEqual(mockAllocations);
  });
  it("sets status to success after load", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
  });
  it("sets error state when service rejects", async () => {
    mockService.getAllocations.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toMatch("Network error");
  });
});

describe("derived summaries", () => {
  it("computes correct summary", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.summary.totalClusters).toBe(3);
    expect(result.current.summary.grandTotal).toBe(14_000_000);
  });
  it("provides unique clusters list", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.clusters).toEqual([
      "Cluster A",
      "Cluster B",
      "Cluster C",
    ]);
  });
});

describe("handleSort", () => {
  it("defaults to village asc", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.sort).toEqual({ field: "village", direction: "asc" });
  });
  it("toggles direction on same field", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.handleSort("village"));
    expect(result.current.sort.direction).toBe("desc");
    act(() => result.current.handleSort("village"));
    expect(result.current.sort.direction).toBe("asc");
  });
  it("resets to asc on a new field", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.handleSort("village"));
    act(() => result.current.handleSort("cluster"));
    expect(result.current.sort).toEqual({ field: "cluster", direction: "asc" });
  });
  it("resets page to 1 on sort change", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.setPage(2));
    act(() => result.current.handleSort("seedsBudget"));
    expect(result.current.page).toBe(1);
  });
});

describe("handleFilter", () => {
  it("filters by village search (case-insensitive)", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.handleFilter({ search: "kiyi" }));
    expect(
      result.current.paginated.every((a) =>
        a.village.toLowerCase().includes("kiyi"),
      ),
    ).toBe(true);
  });
  it("filters by cluster", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.handleFilter({ cluster: "Cluster A" }));
    expect(
      result.current.paginated.every((a) => a.cluster === "Cluster A"),
    ).toBe(true);
  });
  it("returns 0 results for unmatched search", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.handleFilter({ search: "zzznomatch" }));
    expect(result.current.totalFiltered).toBe(0);
  });
  it("resets page to 1 on filter change", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => result.current.setPage(2));
    act(() => result.current.handleFilter({ cluster: "Cluster B" }));
    expect(result.current.page).toBe(1);
  });
});

describe("create", () => {
  it("appends new allocation to state", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    const before = result.current.allocations.length;
    await act(async () => {
      await result.current.create(newFormData);
    });
    expect(result.current.allocations.length).toBe(before + 1);
  });
});

describe("update", () => {
  it("replaces the allocation in state", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    await act(async () => {
      await result.current.update(1, { ...newFormData, village: "New Name" });
    });
    expect(result.current.allocations.find((a) => a.id === 1)?.village).toBe(
      "New Name",
    );
  });
  it("does not change the total count", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    const before = result.current.allocations.length;
    await act(async () => {
      await result.current.update(1, newFormData);
    });
    expect(result.current.allocations.length).toBe(before);
  });
});

describe("remove", () => {
  it("removes allocation from state", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    const before = result.current.allocations.length;
    await act(async () => {
      await result.current.remove(1);
    });
    expect(result.current.allocations.length).toBe(before - 1);
    expect(result.current.allocations.find((a) => a.id === 1)).toBeUndefined();
  });
  it("calls deleteAllocation with correct id", async () => {
    const { result } = renderHook(() => useAllocations());
    await waitFor(() => expect(result.current.status).toBe("success"));
    await act(async () => {
      await result.current.remove(2);
    });
    expect(mockService.deleteAllocation).toHaveBeenCalledWith(2);
  });
});
