import { useState } from "react";
import type { Allocation, AllocationFormData } from "../../types/allocation";
import { useAllocations } from "../../hooks/useAllocations";
import { useTheme } from "../../context/ThemeContext";
import { SummaryCards } from "../../components/SummaryCards";
import { BudgetTable } from "../../components/BudgetTable";
import { AllocationForm } from "../../components/AllocationForm";
import { Charts } from "../../components/Charts";
import { Button } from "../../components/ReusableUI";
import {
  Sun,
  Moon,
  Plus,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export function Dashboard() {
  const { toggleTheme, isDark } = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Allocation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    paginated,
    allocations,
    summary,
    clusterSummaries,
    efficiency,
    clusters,
    status,
    error,
    isLoading,
    sort,
    filter,
    page,
    totalPages,
    pageSize,
    totalFiltered,
    handleSort,
    handleFilter,
    setPage,
    create,
    update,
    remove,
    reload,
  } = useAllocations();

  const handleOpenAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (allocation: Allocation) => {
    setEditTarget(allocation);
    setFormOpen(true);
  };

  const handleSubmit = async (data: AllocationFormData) => {
    if (editTarget) {
      await update(editTarget.id, data);
    } else {
      await create(data);
    }
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await remove(deleteConfirm);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/*  Top App Bar  */}
      <header
        className="
          sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--divider)]
          elevation-2 px-4 sm:px-6
        "
      >
        <div className="max-w-screen-2xl mx-auto h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-md">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[var(--text-primary)] leading-none">
                Program Budget
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Rural Development Dashboard
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {status === "error" && (
              <Button
                variant="outlined"
                size="sm"
                icon={<RefreshCw size={14} />}
                onClick={reload}
              >
                Retry
              </Button>
            )}
            <button
              onClick={toggleTheme}
              className="
                w-9 h-9 rounded-full flex items-center justify-center
                text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
                transition-colors duration-150
              "
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button
              variant="contained"
              size="sm"
              icon={<Plus size={16} />}
              onClick={handleOpenAdd}
            >
              Add Allocation
            </Button>
          </div>
        </div>
      </header>

      {/*  Main Content  */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Error banner */}
        {status === "error" && error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-error-50)] border border-[var(--color-error-500)] text-[var(--color-error-500)] animate-in">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Failed to load allocations</p>
              <p className="text-xs opacity-70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Section: Summary Cards */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
            Program Overview
          </h2>
          <SummaryCards summary={summary} isLoading={isLoading} />
        </section>

        {/* Section: Charts */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
            Analytics
          </h2>
          <Charts
            clusterSummaries={clusterSummaries}
            totalSeedsBudget={summary.totalSeedsBudget}
            totalToolsBudget={summary.totalToolsBudget}
            efficiency={efficiency}
            isLoading={isLoading}
          />
        </section>

        {/* Section: Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              Village Allocations
            </h2>
            {!isLoading && (
              <p className="text-xs text-[var(--text-disabled)]">
                {allocations.length} total records
              </p>
            )}
          </div>
          <BudgetTable
            data={paginated}
            allData={allocations}
            clusters={clusters}
            sort={sort}
            filter={filter}
            page={page}
            totalPages={totalPages}
            totalFiltered={totalFiltered}
            pageSize={pageSize}
            isLoading={isLoading}
            onSort={handleSort}
            onFilter={handleFilter}
            onPageChange={setPage}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRequest}
          />
        </section>

        {/* Footer */}
        <footer className="text-center text-[11px] text-[var(--text-disabled)] pb-4">
          Program Budget & Allocation Dashboard · Data persisted in localStorage
        </footer>
      </main>

      {/*  Allocation Form Modal  */}
      <AllocationForm
        open={formOpen}
        editTarget={editTarget}
        clusters={clusters}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/*  Delete Confirm Dialog  */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="bg-[var(--bg-surface)] rounded-2xl elevation-16 w-full max-w-sm p-6 animate-in">
            <div className="w-12 h-12 rounded-full bg-[var(--color-error-50)] flex items-center justify-center mx-auto mb-4">
              <AlertCircle
                size={24}
                className="text-[var(--color-error-500)]"
              />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)] text-center mb-1">
              Delete Allocation
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This allocation will be permanently removed. This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={deleting}
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
