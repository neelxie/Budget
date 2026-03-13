import type { BudgetSummary } from "../../types/allocation";
import { formatUGX } from "../../utils/calculations";
import { Card, Skeleton } from "../ReusableUI";
import {
  LayoutGrid,
  MapPin,
  Users,
  Sprout,
  Wrench,
  TrendingUp,
} from "lucide-react";

interface SummaryCardsProps {
  summary: BudgetSummary;
  isLoading: boolean;
}

interface CardConfig {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  bgAccent: string;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      label: "Total Clusters",
      value: summary.totalClusters,
      sub: "Active program clusters",
      icon: <LayoutGrid size={22} />,
      accent: "#1976d2",
      bgAccent: "var(--primary-light)",
    },
    {
      label: "Total Villages",
      value: summary.totalVillages,
      sub: "Villages with allocations",
      icon: <MapPin size={22} />,
      accent: "#7b1fa2",
      bgAccent: "rgba(123, 31, 162, 0.10)",
    },
    {
      label: "Beneficiaries",
      value: summary.totalBeneficiaries.toLocaleString(),
      sub: "Total households reached",
      icon: <Users size={22} />,
      accent: "#0288d1",
      bgAccent: "rgba(2, 136, 209, 0.10)",
    },
    {
      label: "Seeds Budget",
      value: formatUGX(summary.totalSeedsBudget),
      sub: `${summary.totalVillages > 0 ? Math.round(summary.totalSeedsBudget / summary.totalVillages).toLocaleString() : 0} avg/village`,
      icon: <Sprout size={22} />,
      accent: "var(--color-seeds)",
      bgAccent: "var(--color-seeds-light)",
    },
    {
      label: "Tools Budget",
      value: formatUGX(summary.totalToolsBudget),
      sub: `${summary.totalVillages > 0 ? Math.round(summary.totalToolsBudget / summary.totalVillages).toLocaleString() : 0} avg/village`,
      icon: <Wrench size={22} />,
      accent: "var(--color-tools)",
      bgAccent: "var(--color-tools-light)",
    },
    {
      label: "Grand Total",
      value: formatUGX(summary.grandTotal),
      sub: `${summary.totalBeneficiaries > 0 ? Math.round(summary.grandTotal / summary.totalBeneficiaries).toLocaleString() : 0} UGX/beneficiary`,
      icon: <TrendingUp size={22} />,
      accent: "#2e7d32",
      bgAccent: "rgba(46, 125, 50, 0.10)",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-28 mb-1" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="p-4 flex flex-col gap-2 animate-in hover:translate-y-[-2px] transition-transform duration-200"
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
            style={{ background: card.bgAccent, color: card.accent }}
          >
            {card.icon}
          </div>

          {/* Label */}
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider leading-none">
            {card.label}
          </p>

          {/* Value */}
          <p
            className="text-lg font-bold leading-tight break-all"
            style={{ color: card.accent }}
          >
            {card.value}
          </p>

          {/* Sub */}
          {card.sub && (
            <p className="text-[11px] text-[var(--text-disabled)] leading-none">
              {card.sub}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
