import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetTable } from '../../components/BudgetTable'
import { mockAllocations } from '../fixtures'
import type { FilterConfig, SortConfig } from '../../types/allocation'

const defaultProps = {
  data: mockAllocations,
  allData: mockAllocations,
  clusters: ['Cluster A', 'Cluster B', 'Cluster C'],
  sort: { field: 'village', direction: 'asc' } as SortConfig,
  filter: { search: '', cluster: '' } as FilterConfig,
  page: 1, totalPages: 1,
  totalFiltered: mockAllocations.length,
  pageSize: 8, isLoading: false,
  onSort: vi.fn(), onFilter: vi.fn(), onPageChange: vi.fn(),
  onEdit: vi.fn(), onDelete: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('loading state', () => {
  it('renders skeletons when isLoading=true', () => {
    const { container } = render(<BudgetTable {...defaultProps} isLoading={true} />)
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0)
  })
  it('hides village names while loading', () => {
    render(<BudgetTable {...defaultProps} isLoading={true} />)
    expect(screen.queryByText('Kiyindi')).toBeNull()
  })
})

describe('data rendering', () => {
  it('renders a row for each allocation', () => {
    render(<BudgetTable {...defaultProps} />)
    expect(screen.getByText('Kiyindi')).toBeInTheDocument()
    expect(screen.getByText('Buwunga')).toBeInTheDocument()
    expect(screen.getByText('Nabuganyi')).toBeInTheDocument()
    expect(screen.getByText('Kalagala')).toBeInTheDocument()
  })
  it('shows empty state when data is empty', () => {
    render(<BudgetTable {...defaultProps} data={[]} totalFiltered={0} />)
    expect(screen.getByText('No allocations found')).toBeInTheDocument()
  })
  it('shows filter hint in empty state', () => {
    render(<BudgetTable {...defaultProps} data={[]} totalFiltered={0} />)
    expect(screen.getByText(/try adjusting/i)).toBeInTheDocument()
  })
})

describe('column sorting', () => {
  it.each([
    ['Village', 'village'],
    ['Cluster', 'cluster'],
    ['Beneficiaries', 'beneficiaries'],
    ['Seeds Budget', 'seedsBudget'],
    ['Tools Budget', 'toolsBudget'],
    ['Total Budget', 'totalBudget'],
  ])('clicking "%s" calls onSort("%s")', (label, field) => {
    const onSort = vi.fn()
    render(<BudgetTable {...defaultProps} onSort={onSort} />)
    fireEvent.click(screen.getByText(label))
    expect(onSort).toHaveBeenCalledWith(field)
  })
})

describe('search and filter toolbar', () => {
  it('calls onFilter when user types in search', async () => {
    const onFilter = vi.fn()
    render(<BudgetTable {...defaultProps} onFilter={onFilter} />)
    await userEvent.type(screen.getByPlaceholderText('Search village…'), 'K')
    expect(onFilter).toHaveBeenLastCalledWith({ search: 'K' })
  })
  it('shows Clear when search is active', () => {
    render(<BudgetTable {...defaultProps} filter={{ search: 'test', cluster: '' }} />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })
  it('hides Clear when no filter is active', () => {
    render(<BudgetTable {...defaultProps} />)
    expect(screen.queryByText('Clear')).toBeNull()
  })
  it('calls onFilter with empty values when Clear clicked', async () => {
    const onFilter = vi.fn()
    render(<BudgetTable {...defaultProps} filter={{ search: 'test', cluster: '' }} onFilter={onFilter} />)
    await userEvent.click(screen.getByText('Clear'))
    expect(onFilter).toHaveBeenCalledWith({ search: '', cluster: '' })
  })
})

describe('row actions', () => {
  it('calls onEdit with correct allocation', async () => {
    const onEdit = vi.fn()
    render(<BudgetTable {...defaultProps} onEdit={onEdit} />)
    await userEvent.click(screen.getAllByTitle('Edit')[0])
    expect(onEdit).toHaveBeenCalledWith(mockAllocations[0])
  })
  it('calls onDelete with correct id', async () => {
    const onDelete = vi.fn()
    render(<BudgetTable {...defaultProps} onDelete={onDelete} />)
    await userEvent.click(screen.getAllByTitle('Delete')[0])
    expect(onDelete).toHaveBeenCalledWith(mockAllocations[0].id)
  })
})

describe('CSV export', () => {
  it('calls URL.createObjectURL on export', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<BudgetTable {...defaultProps} />)
    await userEvent.click(screen.getByText('Export CSV'))
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })
  it('calls URL.revokeObjectURL to prevent memory leaks', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<BudgetTable {...defaultProps} />)
    await userEvent.click(screen.getByText('Export CSV'))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    vi.restoreAllMocks()
  })
})

describe('pagination', () => {
  it('Prev is disabled on page 1', () => {
    render(<BudgetTable {...defaultProps} page={1} totalPages={3} />)
    expect(screen.getByRole('button', { name: /Prev/ })).toBeDisabled()
  })
  it('Next is disabled on last page', () => {
    render(<BudgetTable {...defaultProps} page={3} totalPages={3} />)
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled()
  })
  it('calls onPageChange(2) when Next clicked on page 1', async () => {
    const onPageChange = vi.fn()
    render(<BudgetTable {...defaultProps} page={1} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
  it('calls onPageChange(1) when Prev clicked on page 2', async () => {
    const onPageChange = vi.fn()
    render(<BudgetTable {...defaultProps} page={2} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Prev/ }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})