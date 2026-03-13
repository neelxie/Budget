import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Allocation,
  AllocationFormData,
  ApiStatus,
  FilterConfig,
  SortConfig,
} from "../types/allocation";
import * as service from "../services/allocationService";
import {
  computeClusterSummaries,
  computeEfficiency,
  computeSummary,
  getUniqueClusters,
  getTotalBudget,
} from "../utils/calculations";

const PAGE_SIZE = 8;

export function useAllocations() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [status, setStatus] = useState<ApiStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  //  Table UI state
  const [sort, setSort] = useState<SortConfig>({
    field: "village",
    direction: "asc",
  });
  const [filter, setFilter] = useState<FilterConfig>({
    search: "",
    cluster: "",
  });
  const [page, setPage] = useState(1);

  //  Load
  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await service.getAllocations();
      setAllocations(data);
      setStatus("success");
    } catch (e) {
      setError(String(e));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  //  Create
  const create = useCallback(
    async (data: AllocationFormData): Promise<void> => {
      setStatus("loading");
      try {
        const created = await service.createAllocation(data);
        setAllocations((prev) => [...prev, created]);
        setStatus("success");
      } catch (e) {
        setError(String(e));
        setStatus("error");
        throw e;
      }
    },
    [],
  );

  //  Update
  const update = useCallback(
    async (id: number, data: AllocationFormData): Promise<void> => {
      setStatus("loading");
      try {
        const updated = await service.updateAllocation(id, data);
        setAllocations((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setStatus("success");
      } catch (e) {
        setError(String(e));
        setStatus("error");
        throw e;
      }
    },
    [],
  );

  //  Delete
  const remove = useCallback(async (id: number): Promise<void> => {
    setStatus("loading");
    try {
      await service.deleteAllocation(id);
      setAllocations((prev) => prev.filter((a) => a.id !== id));
      setStatus("success");
    } catch (e) {
      setError(String(e));
      setStatus("error");
      throw e;
    }
  }, []);

  //  Sorting
  const handleSort = useCallback((field: SortConfig["field"]) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  //  Filtering
  const handleFilter = useCallback((update: Partial<FilterConfig>) => {
    setFilter((prev) => ({ ...prev, ...update }));
    setPage(1);
  }, []);

  //  Derived: filtered + sorted
  const processed = useMemo(() => {
    let result = [...allocations];

    // Search by village
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter((a) => a.village.toLowerCase().includes(q));
    }

    // Filter by cluster
    if (filter.cluster) {
      result = result.filter((a) => a.cluster === filter.cluster);
    }

    // Sort
    result.sort((a, b) => {
      let av: number | string;
      let bv: number | string;

      switch (sort.field) {
        case "totalBudget":
          av = getTotalBudget(a);
          bv = getTotalBudget(b);
          break;
        case "beneficiaries":
          av = a.beneficiaries;
          bv = b.beneficiaries;
          break;
        case "seedsBudget":
          av = a.seedsBudget;
          bv = b.seedsBudget;
          break;
        case "toolsBudget":
          av = a.toolsBudget;
          bv = b.toolsBudget;
          break;
        case "cluster":
          av = a.cluster;
          bv = b.cluster;
          break;
        default:
          av = a.village;
          bv = b.village;
      }

      if (av < bv) return sort.direction === "asc" ? -1 : 1;
      if (av > bv) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [allocations, filter, sort]);

  //  Pagination
  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paginated = useMemo(
    () => processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [processed, page],
  );

  //  Derived summaries
  const summary = useMemo(() => computeSummary(allocations), [allocations]);
  const clusterSummaries = useMemo(
    () => computeClusterSummaries(allocations),
    [allocations],
  );
  const efficiency = useMemo(
    () => computeEfficiency(allocations),
    [allocations],
  );
  const clusters = useMemo(() => getUniqueClusters(allocations), [allocations]);

  return {
    // data
    allocations,
    paginated,
    summary,
    clusterSummaries,
    efficiency,
    clusters,
    // status
    status,
    error,
    isLoading: status === "loading",
    // pagination
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    totalFiltered: processed.length,
    setPage,
    // sort & filter
    sort,
    filter,
    handleSort,
    handleFilter,
    // actions
    create,
    update,
    remove,
    reload: load,
  };
}
