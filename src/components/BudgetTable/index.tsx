import type {
  Allocation,
  FilterConfig,
  SortConfig,
} from "../../types/allocation";
import { formatUGX, getTotalBudget, toCSV } from "../../utils/calculations";
import { Badge, Button, Card, Input, Select, Skeleton } from "../ReusableUI";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import type { SortField } from "../../types/allocation";

interface BudgetTableProps {
  data: Allocation[];
  allData: Allocation[];
  clusters: string[];
  sort: SortConfig;
  filter: FilterConfig;
  page: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  isLoading: boolean;
  onSort: (field: SortField) => void;
  onFilter: (update: Partial<FilterConfig>) => void;
  onPageChange: (page: number) => void;
  onEdit: (allocation: Allocation) => void;
  onDelete: (id: number) => void;
}

function SortIcon({ field, sort }: { field: SortField; sort: SortConfig }) {
  if (sort.field !== field)
    return <ArrowUpDown size={14} className="opacity-30" />;
  return sort.direction === "asc" ? (
    <ArrowUp size={14} className="text-[var(--primary)]" />
  ) : (
    <ArrowDown size={14} className="text-[var(--primary)]" />
  );
}

function SortableTh({
  field,
  label,
  sort,
  onSort,
  align = "left",
}: {
  field: SortField;
  label: string;
  sort: SortConfig;
  onSort: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = sort.field === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`
        px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none
        whitespace-nowrap transition-colors duration-150
        ${align === "right" ? "text-right" : "text-left"}
        ${isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}
        hover:text-[var(--primary)] hover:bg-[var(--bg-hover)]
      `}
    >
      <span
        className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <SortIcon field={field} sort={sort} />
      </span>
    </th>
  );
}

const CLUSTER_COLORS: Record<
  string,
  "blue" | "purple" | "orange" | "green" | "gray"
> = {
  "Cluster A": "blue",
  "Cluster B": "purple",
  "Cluster C": "orange",
  "Cluster D": "green",
};

export function BudgetTable({
  data,
  allData,
  clusters,
  sort,
  filter,
  page,
  totalPages,
  totalFiltered,
  pageSize,
  isLoading,
  onSort,
  onFilter,
  onPageChange,
  onEdit,
  onDelete,
}: BudgetTableProps) {
  const handleExport = () => {
    const csv = toCSV(allData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `budget-allocations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clusterOptions = [
    { label: "All Clusters", value: "" },
    ...clusters.map((c) => ({ label: c, value: c })),
  ];

  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalFiltered);

  return (
    <Card className="overflow-hidden animate-in">
      {/* Toolbar */}
      <div className="px-4 py-3 flex flex-col sm:flex-row gap-3 border-b border-[var(--divider)]">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 max-w-xs">
            <Input
              placeholder="Search village…"
              value={filter.search}
              onChange={(e) => onFilter({ search: e.target.value })}
              icon={<Search size={15} />}
            />
          </div>
          <div className="w-40">
            <Select
              value={filter.cluster}
              onChange={(v) => onFilter({ cluster: v })}
              options={clusterOptions}
              placeholder=""
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(filter.search || filter.cluster) && (
            <Button
              variant="text"
              size="sm"
              icon={<Filter size={14} />}
              onClick={() => onFilter({ search: "", cluster: "" })}
            >
              Clear
            </Button>
          )}
          <Button
            variant="outlined"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--divider)]">
              <SortableTh
                field="village"
                label="Village"
                sort={sort}
                onSort={onSort}
              />
              <SortableTh
                field="cluster"
                label="Cluster"
                sort={sort}
                onSort={onSort}
              />
              <SortableTh
                field="beneficiaries"
                label="Beneficiaries"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                field="seedsBudget"
                label="Seeds Budget"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                field="toolsBudget"
                label="Tools Budget"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                field="totalBudget"
                label="Total Budget"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--divider)]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-2)] flex items-center justify-center">
                      <Filter
                        size={28}
                        className="text-[var(--text-disabled)]"
                      />
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium">
                      No allocations found
                    </p>
                    <p className="text-xs text-[var(--text-disabled)]">
                      Try adjusting your search or filter
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const total = getTotalBudget(row);
                const clusterColor = CLUSTER_COLORS[row.cluster] ?? "gray";
                return (
                  <tr
                    key={row.id}
                    className={`
                      border-b border-[var(--divider)]
                      transition-colors duration-100
                      hover:bg-[var(--bg-hover)]
                      ${idx % 2 === 0 ? "" : "bg-[var(--bg-surface-2)]/40"}
                    `}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm text-[var(--text-primary)]">
                        {row.village}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={clusterColor}>{row.cluster}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-numeric text-[var(--text-primary)]">
                        {row.beneficiaries.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-sm font-numeric"
                        style={{ color: "var(--color-seeds)" }}
                      >
                        {row.seedsBudget.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-sm font-numeric"
                        style={{ color: "var(--color-tools)" }}
                      >
                        {row.toolsBudget.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold font-numeric text-[var(--primary)]">
                        {formatUGX(total)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(row)}
                          className="
                            w-8 h-8 rounded-lg flex items-center justify-center
                            text-[var(--text-secondary)] hover:bg-[var(--primary-light)]
                            hover:text-[var(--primary)] transition-colors duration-150
                          "
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(row.id)}
                          className="
                            w-8 h-8 rounded-lg flex items-center justify-center
                            text-[var(--text-secondary)] hover:bg-[#ffebee]
                            hover:text-[#f44336] transition-colors duration-150
                          "
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--divider)]">
        <p className="text-xs text-[var(--text-secondary)]">
          {isLoading
            ? "—"
            : totalFiltered === 0
              ? "No results"
              : `Showing ${startRow}–${endRow} of ${totalFiltered} allocations`}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="text"
            size="sm"
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            icon={<ChevronLeft size={16} />}
          >
            Prev
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
            )
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (
                i > 0 &&
                typeof arr[i - 1] === "number" &&
                (p as number) - (arr[i - 1] as number) > 1
              ) {
                acc.push("...");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-[var(--text-disabled)]"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`
                    w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                      page === p
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                    }
                  `}
                >
                  {p}
                </button>
              ),
            )}

          <Button
            variant="text"
            size="sm"
            disabled={page === totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            icon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
