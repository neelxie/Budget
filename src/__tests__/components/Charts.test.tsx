import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Charts } from '../../components/Charts'
import { ThemeProvider } from '../../context/ThemeContext'

const defaultProps = {
  clusterSummaries: [
    { cluster: 'Cluster A', seedsBudget: 3_600_000, toolsBudget: 2_700_000, total: 6_300_000, villages: 2, beneficiaries: 210 },
    { cluster: 'Cluster B', seedsBudget: 4_400_000, toolsBudget: 3_200_000, total: 7_600_000, villages: 2, beneficiaries: 245 },
  ],
  totalSeedsBudget: 8_000_000,
  totalToolsBudget: 5_900_000,
  efficiency: [
    { village: 'Kiyindi', perBeneficiary: 29_167 },
    { village: 'Buwunga', perBeneficiary: 31_111 },
  ],
  isLoading: false,
}

function renderCharts(props = {}) {
  return render(
    <ThemeProvider>
      <Charts {...defaultProps} {...props} />
    </ThemeProvider>
  )
}

describe('loading state', () => {
  it('renders 4 skeleton cards when isLoading=true', () => {
    const { container } = renderCharts({ isLoading: true })
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThanOrEqual(4)
  })
})
