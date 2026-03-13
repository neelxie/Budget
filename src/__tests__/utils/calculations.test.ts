import { describe, it, expect } from 'vitest'
import {
  getTotalBudget, computeSummary, computeClusterSummaries,
  computeEfficiency, formatUGX, formatMillions,
  getUniqueClusters, generateId, toCSV,
} from '../../utils/calculations'
import { mockAllocations, singleAllocation, expectedSummary } from '../fixtures'

describe('getTotalBudget', () => {
  it('sums seedsBudget and toolsBudget', () => {
    expect(getTotalBudget(singleAllocation)).toBe(3_500_000)
  })
  it('returns 0 when both budgets are 0', () => {
    expect(getTotalBudget({ ...singleAllocation, seedsBudget: 0, toolsBudget: 0 })).toBe(0)
  })
  it('handles large numbers without precision loss', () => {
    expect(getTotalBudget({ ...singleAllocation, seedsBudget: 99_999_999, toolsBudget: 1 })).toBe(100_000_000)
  })
})

describe('computeSummary', () => {
  it('computes all fields correctly from fixture data', () => {
    expect(computeSummary(mockAllocations)).toEqual(expectedSummary)
  })
  it('returns zeros for empty array', () => {
    expect(computeSummary([])).toEqual({
      totalClusters: 0, totalVillages: 0, totalBeneficiaries: 0,
      totalSeedsBudget: 0, totalToolsBudget: 0, grandTotal: 0,
    })
  })
  it('counts unique clusters not total rows', () => {
    expect(computeSummary(mockAllocations).totalClusters).toBe(3)
  })
  it('grandTotal equals seeds + tools totals', () => {
    const { totalSeedsBudget, totalToolsBudget, grandTotal } = computeSummary(mockAllocations)
    expect(grandTotal).toBe(totalSeedsBudget + totalToolsBudget)
  })
})

describe('computeClusterSummaries', () => {
  it('returns one entry per unique cluster', () => {
    expect(computeClusterSummaries(mockAllocations)).toHaveLength(3)
  })
  it('sorts clusters alphabetically', () => {
    const result = computeClusterSummaries(mockAllocations)
    expect(result.map(c => c.cluster)).toEqual(['Cluster A', 'Cluster B', 'Cluster C'])
  })
  it('aggregates budgets for the same cluster', () => {
    const clusterA = computeClusterSummaries(mockAllocations).find(c => c.cluster === 'Cluster A')!
    expect(clusterA.seedsBudget).toBe(3_600_000)
    expect(clusterA.toolsBudget).toBe(2_700_000)
    expect(clusterA.total).toBe(6_300_000)
  })
  it('counts villages per cluster', () => {
    const clusterA = computeClusterSummaries(mockAllocations).find(c => c.cluster === 'Cluster A')!
    expect(clusterA.villages).toBe(2)
  })
  it('aggregates beneficiaries per cluster', () => {
    const clusterA = computeClusterSummaries(mockAllocations).find(c => c.cluster === 'Cluster A')!
    expect(clusterA.beneficiaries).toBe(210)
  })
  it('returns empty array for empty input', () => {
    expect(computeClusterSummaries([])).toEqual([])
  })
})

describe('computeEfficiency', () => {
  it('calculates UGX per beneficiary rounded', () => {
    // 3_500_000 / 120 = 29166.67 → 29167
    expect(computeEfficiency([singleAllocation])[0].perBeneficiary).toBe(29167)
  })
  it('sorts descending by perBeneficiary', () => {
    const result = computeEfficiency(mockAllocations)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].perBeneficiary).toBeGreaterThanOrEqual(result[i + 1].perBeneficiary)
    }
  })
  it('excludes rows with 0 beneficiaries', () => {
    const result = computeEfficiency([...mockAllocations, { ...singleAllocation, id: 99, beneficiaries: 0 }])
    expect(result.every(r => isFinite(r.perBeneficiary))).toBe(true)
  })
  it('returns empty array for empty input', () => {
    expect(computeEfficiency([])).toEqual([])
  })
})

describe('formatUGX', () => {
  it('prefixes with UGX', () => {
    expect(formatUGX(1_500_000)).toMatch(/^UGX /)
  })
  it('formats zero correctly', () => {
    expect(formatUGX(0)).toBe('UGX 0')
  })
})

describe('formatMillions', () => {
  it('formats >= 1M with M suffix', () => {
    expect(formatMillions(1_000_000)).toBe('1.0M')
    expect(formatMillions(2_500_000)).toBe('2.5M')
  })
  it('formats >= 1K with K suffix', () => {
    expect(formatMillions(1_000)).toBe('1K')
    expect(formatMillions(500_000)).toBe('500K')
  })
  it('returns plain string below 1000', () => {
    expect(formatMillions(0)).toBe('0')
    expect(formatMillions(999)).toBe('999')
  })
})

describe('getUniqueClusters', () => {
  it('returns sorted unique cluster names', () => {
    expect(getUniqueClusters(mockAllocations)).toEqual(['Cluster A', 'Cluster B', 'Cluster C'])
  })
  it('returns empty array for empty input', () => {
    expect(getUniqueClusters([])).toEqual([])
  })
  it('deduplicates repeated clusters', () => {
    const result = getUniqueClusters(mockAllocations)
    expect(result.length).toBe(new Set(result).size)
  })
})

describe('generateId', () => {
  it('returns 1 for empty array', () => {
    expect(generateId([])).toBe(1)
  })
  it('returns max id + 1', () => {
    expect(generateId(mockAllocations)).toBe(5)
  })
  it('handles non-sequential ids', () => {
    expect(generateId([{ ...singleAllocation, id: 10 }, { ...singleAllocation, id: 3 }])).toBe(11)
  })
})

describe('toCSV', () => {
  it('first row is the correct header', () => {
    expect(toCSV(mockAllocations).split('\n')[0]).toBe(
      'ID,Village,Cluster,Beneficiaries,Seeds Budget (UGX),Tools Budget (UGX),Total Budget (UGX)'
    )
  })
  it('produces header + one row per allocation', () => {
    expect(toCSV(mockAllocations).split('\n')).toHaveLength(mockAllocations.length + 1)
  })
  it('Total Budget column matches getTotalBudget()', () => {
    const cols = toCSV([singleAllocation]).split('\n')[1].split(',')
    expect(Number(cols[cols.length - 1])).toBe(getTotalBudget(singleAllocation))
  })
  it('returns only header for empty input', () => {
    expect(toCSV([]).split('\n')).toHaveLength(1)
  })
})