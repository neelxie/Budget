import type {
  Allocation,
  AllocationFormData,
  BudgetSummary,
} from "../types/allocation";

export const mockAllocations: Allocation[] = [
  {
    id: 1,
    village: "Kiyindi",
    cluster: "Cluster A",
    beneficiaries: 120,
    seedsBudget: 2_000_000,
    toolsBudget: 1_500_000,
  },
  {
    id: 2,
    village: "Buwunga",
    cluster: "Cluster A",
    beneficiaries: 90,
    seedsBudget: 1_600_000,
    toolsBudget: 1_200_000,
  },
  {
    id: 3,
    village: "Nabuganyi",
    cluster: "Cluster B",
    beneficiaries: 140,
    seedsBudget: 2_500_000,
    toolsBudget: 1_800_000,
  },
  {
    id: 4,
    village: "Kalagala",
    cluster: "Cluster C",
    beneficiaries: 110,
    seedsBudget: 2_100_000,
    toolsBudget: 1_300_000,
  },
];

export const singleAllocation: Allocation = mockAllocations[0];

export const newFormData: AllocationFormData = {
  village: "Wantome",
  cluster: "Cluster B",
  beneficiaries: 85,
  seedsBudget: 1_400_000,
  toolsBudget: 1_050_000,
};

export const expectedSummary: BudgetSummary = {
  totalClusters: 3,
  totalVillages: 4,
  totalBeneficiaries: 460,
  totalSeedsBudget: 8_200_000,
  totalToolsBudget: 5_800_000,
  grandTotal: 14_000_000,
};
