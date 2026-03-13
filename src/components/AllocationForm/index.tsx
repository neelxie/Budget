import { useEffect, useState } from "react";
import type {
  Allocation,
  AllocationFormData,
  AllocationFormErrors,
} from "../../types/allocation";
import { Button, Input, Select } from "../ReusableUI";
import { X } from "lucide-react";

interface AllocationFormProps {
  open: boolean;
  editTarget: Allocation | null;
  clusters: string[];
  onClose: () => void;
  onSubmit: (data: AllocationFormData) => Promise<void>;
}

const CLUSTER_OPTIONS = [
  "Cluster A",
  "Cluster B",
  "Cluster C",
  "Cluster D",
  "Cluster E",
];

const EMPTY: AllocationFormData = {
  village: "",
  cluster: "",
  beneficiaries: 0,
  seedsBudget: 0,
  toolsBudget: 0,
};

function validate(data: AllocationFormData): AllocationFormErrors {
  const e: AllocationFormErrors = {};
  if (!data.village.trim()) e.village = "Village name is required";
  else if (data.village.trim().length < 2)
    e.village = "Must be at least 2 characters";
  if (!data.cluster) e.cluster = "Please select a cluster";
  if (!data.beneficiaries || data.beneficiaries < 1)
    e.beneficiaries = "Must be at least 1 beneficiary";
  else if (data.beneficiaries > 10_000)
    e.beneficiaries = "Seems too high — max 10,000";
  if (!data.seedsBudget || data.seedsBudget < 1)
    e.seedsBudget = "Seeds budget must be greater than 0";
  if (!data.toolsBudget || data.toolsBudget < 1)
    e.toolsBudget = "Tools budget must be greater than 0";
  return e;
}

export function AllocationForm({
  open,
  editTarget,
  clusters,
  onClose,
  onSubmit,
}: AllocationFormProps) {
  const [form, setForm] = useState<AllocationFormData>(EMPTY);
  const [errors, setErrors] = useState<AllocationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // All known clusters merged with defaults
  const allClusters = Array.from(
    new Set([...CLUSTER_OPTIONS, ...clusters]),
  ).sort();

  // Seed form when editing
  useEffect(() => {
    if (editTarget) {
      const { id: _id, ...data } = editTarget;
      setForm(data);
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editTarget, open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key: keyof AllocationFormData) => (value: string) => {
    const parsed = ["beneficiaries", "seedsBudget", "toolsBudget"].includes(key)
      ? Number(value.replace(/,/g, ""))
      : value;
    setForm((prev) => ({ ...prev, [key]: parsed }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const totalPreview = (form.seedsBudget || 0) + (form.toolsBudget || 0);

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
          bg-[var(--bg-surface)] rounded-2xl elevation-16 w-full max-w-lg
          animate-in overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--divider)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {editTarget ? "Edit Allocation" : "Add New Allocation"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {editTarget
                ? `Editing ${editTarget.village}`
                : "Fill in details for the new village allocation"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-full flex items-center justify-center
              text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
              transition-colors duration-150
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Village Name"
                placeholder="e.g. Kiyindi"
                value={form.village}
                onChange={(e) => set("village")(e.target.value)}
                error={errors.village}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <Select
                label="Cluster"
                value={form.cluster}
                onChange={set("cluster")}
                placeholder="Select cluster…"
                options={allClusters.map((c) => ({ label: c, value: c }))}
                error={errors.cluster}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <Input
                label="Beneficiaries"
                type="number"
                min={1}
                placeholder="e.g. 120"
                value={form.beneficiaries || ""}
                onChange={(e) => set("beneficiaries")(e.target.value)}
                error={errors.beneficiaries}
              />
            </div>

            <div>
              <Input
                label="Seeds Budget (UGX)"
                type="number"
                min={1}
                placeholder="e.g. 2000000"
                value={form.seedsBudget || ""}
                onChange={(e) => set("seedsBudget")(e.target.value)}
                error={errors.seedsBudget}
              />
            </div>

            <div>
              <Input
                label="Tools Budget (UGX)"
                type="number"
                min={1}
                placeholder="e.g. 1500000"
                value={form.toolsBudget || ""}
                onChange={(e) => set("toolsBudget")(e.target.value)}
                error={errors.toolsBudget}
              />
            </div>
          </div>

          {/* Live total preview */}
          {totalPreview > 0 && (
            <div className="rounded-xl bg-[var(--primary-light)] px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--primary)]">
                Computed Total Budget
              </span>
              <span className="text-base font-bold text-[var(--primary)] font-numeric">
                UGX {totalPreview.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--divider)] flex items-center justify-end gap-3">
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            loading={submitting}
            onClick={handleSubmit}
          >
            {editTarget ? "Save Changes" : "Add Allocation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
