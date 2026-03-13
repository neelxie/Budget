import type { Allocation, AllocationFormData } from "../types/allocation";
import { generateId } from "../utils/calculations";

const STORAGE_KEY = "budget_allocations";

const SEED_DATA: Allocation[] = [
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
  {
    id: 5,
    village: "Wantome",
    cluster: "Cluster B",
    beneficiaries: 85,
    seedsBudget: 1_400_000,
    toolsBudget: 1_050_000,
  },
  {
    id: 6,
    village: "Bukolwa",
    cluster: "Cluster C",
    beneficiaries: 95,
    seedsBudget: 1_750_000,
    toolsBudget: 1_150_000,
  },
  {
    id: 7,
    village: "Namugongo",
    cluster: "Cluster A",
    beneficiaries: 130,
    seedsBudget: 2_200_000,
    toolsBudget: 1_700_000,
  },
  {
    id: 8,
    village: "Lugazi",
    cluster: "Cluster B",
    beneficiaries: 105,
    seedsBudget: 1_900_000,
    toolsBudget: 1_400_000,
  },
];

/** Simulate network delay */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function readStorage(): Allocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_DATA;
    return JSON.parse(raw) as Allocation[];
  } catch {
    return SEED_DATA;
  }
}

function writeStorage(data: Allocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("localStorage write failed", e);
  }
}

//  GET /allocations
export async function getAllocations(): Promise<Allocation[]> {
  await delay();
  return readStorage();
}

//  POST /allocations
export async function createAllocation(
  data: AllocationFormData,
): Promise<Allocation> {
  await delay();
  const current = readStorage();
  const newItem: Allocation = { id: generateId(current), ...data };
  writeStorage([...current, newItem]);
  return newItem;
}

//  PATCH /allocations/:id
export async function updateAllocation(
  id: number,
  data: AllocationFormData,
): Promise<Allocation> {
  await delay();
  const current = readStorage();
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error(`Allocation ${id} not found`);
  const updated: Allocation = { id, ...data };
  const next = [...current];
  next[idx] = updated;
  writeStorage(next);
  return updated;
}

//  DELETE /allocations/:id
export async function deleteAllocation(id: number): Promise<void> {
  await delay(200);
  const current = readStorage();
  writeStorage(current.filter((a) => a.id !== id));
}

/** Reset to seed data — useful for development */
export function resetStorage(): void {
  writeStorage(SEED_DATA);
}
