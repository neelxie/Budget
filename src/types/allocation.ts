export interface Allocation {
  id: number;
  village: string;
  cluster: string;
  beneficiaries: number;
  seedsBudget: number;
  toolsBudget: number;
}

export type AllocationFormData = Omit<Allocation, "id">;

export interface AllocationFormErrors {
  village?: string;
  cluster?: string;
  beneficiaries?: string;
  seedsBudget?: string;
  toolsBudget?: string;
}

export interface BudgetSummary {
  totalClusters: number;
  totalVillages: number;
  totalBeneficiaries: number;
  totalSeedsBudget: number;
  totalToolsBudget: number;
  grandTotal: number;
}

export interface ClusterSummary {
  cluster: string;
  seedsBudget: number;
  toolsBudget: number;
  total: number;
  villages: number;
  beneficiaries: number;
}

export type SortField =
  | "village"
  | "cluster"
  | "beneficiaries"
  | "seedsBudget"
  | "toolsBudget"
  | "totalBudget";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  search: string;
  cluster: string;
}

export type ApiStatus = "idle" | "loading" | "success" | "error";
