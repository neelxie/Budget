import type {
  Allocation,
  BudgetSummary,
  ClusterSummary,
} from "../types/allocation";

/** Row-level total */
export function getTotalBudget(a: Allocation): number {
  return a.seedsBudget + a.toolsBudget;
}

/** Dashboard summary cards */
export function computeSummary(allocations: Allocation[]): BudgetSummary {
  const clusters = new Set(allocations.map((a) => a.cluster));
  return {
    totalClusters: clusters.size,
    totalVillages: allocations.length,
    totalBeneficiaries: allocations.reduce(
      (sum, a) => sum + a.beneficiaries,
      0,
    ),
    totalSeedsBudget: allocations.reduce((sum, a) => sum + a.seedsBudget, 0),
    totalToolsBudget: allocations.reduce((sum, a) => sum + a.toolsBudget, 0),
    grandTotal: allocations.reduce((sum, a) => sum + getTotalBudget(a), 0),
  };
}

/** Per-cluster aggregation for bar chart */
export function computeClusterSummaries(
  allocations: Allocation[],
): ClusterSummary[] {
  const map = new Map<string, ClusterSummary>();

  for (const a of allocations) {
    const existing = map.get(a.cluster);
    if (existing) {
      existing.seedsBudget += a.seedsBudget;
      existing.toolsBudget += a.toolsBudget;
      existing.total += getTotalBudget(a);
      existing.villages += 1;
      existing.beneficiaries += a.beneficiaries;
    } else {
      map.set(a.cluster, {
        cluster: a.cluster,
        seedsBudget: a.seedsBudget,
        toolsBudget: a.toolsBudget,
        total: getTotalBudget(a),
        villages: 1,
        beneficiaries: a.beneficiaries,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.cluster.localeCompare(b.cluster),
  );
}

/** Budget efficiency — UGX per beneficiary */
export function computeEfficiency(
  allocations: Allocation[],
): Array<{ village: string; perBeneficiary: number }> {
  return allocations
    .filter((a) => a.beneficiaries > 0)
    .map((a) => ({
      village: a.village,
      perBeneficiary: Math.round(getTotalBudget(a) / a.beneficiaries),
    }))
    .sort((a, b) => b.perBeneficiary - a.perBeneficiary);
}

/** Format UGX with commas */
export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString("en-UG")}`;
}

/** Short format for chart axes */
export function formatMillions(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
}

/** Unique clusters from dataset */
export function getUniqueClusters(allocations: Allocation[]): string[] {
  return Array.from(new Set(allocations.map((a) => a.cluster))).sort();
}

/** Generate next numeric ID */
export function generateId(allocations: Allocation[]): number {
  return allocations.length === 0
    ? 1
    : Math.max(...allocations.map((a) => a.id)) + 1;
}

/** Export allocations as CSV string */
export function toCSV(allocations: Allocation[]): string {
  const headers = [
    "ID",
    "Village",
    "Cluster",
    "Beneficiaries",
    "Seeds Budget (UGX)",
    "Tools Budget (UGX)",
    "Total Budget (UGX)",
  ];
  const rows = allocations.map((a) => [
    a.id,
    a.village,
    a.cluster,
    a.beneficiaries,
    a.seedsBudget,
    a.toolsBudget,
    getTotalBudget(a),
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}
