import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { ClusterSummary } from "../../types/allocation";
import { formatMillions, formatUGX } from "../../utils/calculations";
import { Card, Skeleton } from "../ReusableUI";
import { useTheme } from "../../context/ThemeContext";

interface ChartsProps {
  clusterSummaries: ClusterSummary[];
  totalSeedsBudget: number;
  totalToolsBudget: number;
  efficiency: Array<{ village: string; perBeneficiary: number }>;
  isLoading: boolean;
}

//  Color palettes
const CLUSTER_COLORS = ["#1976d2", "#7b1fa2", "#e65100", "#2e7d32", "#c62828"];
const PIE_COLORS = ["#2e7d32", "#e65100"];

// Typed as `any` to satisfy Recharts' complex union types (LabelFormatter,
// Formatter<ValueType,NameType>) without unsafe inline casts in JSX.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const labelMillions = (v: any): string =>
  typeof v === 'number' ? formatMillions(v) : ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pieTooltipFormatter = (v: any): [string, string] =>
  [typeof v === 'number' ? formatUGX(v) : String(v ?? ''), '']


//  Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl elevation-8 p-3 text-sm border border-[var(--divider)] min-w-[160px]">
      <p className="font-semibold text-[var(--text-primary)] mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-[var(--text-secondary)]">{entry.name}:</span>
          <span className="font-medium text-[var(--text-primary)] font-numeric ml-auto">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  isLoading,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card className="p-5 flex flex-col gap-4 animate-in">
      <div>
        <h3 className="font-semibold text-[var(--text-primary)] text-sm">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {isLoading ? <Skeleton className="h-56 w-full rounded-xl" /> : children}
    </Card>
  );
}

export function Charts({
  clusterSummaries,
  totalSeedsBudget,
  totalToolsBudget,
  efficiency,
  isLoading,
}: ChartsProps) {
  const { isDark } = useTheme();
  const axisColor = isDark ? "#90a4ae" : "#9e9e9e";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  // Chart 1: Budget by cluster (stacked bar)
  const clusterData = clusterSummaries.map((c) => ({
    cluster: c.cluster.replace("Cluster ", "C"),
    "Seeds Budget": c.seedsBudget,
    "Tools Budget": c.toolsBudget,
    fullName: c.cluster,
  }));

  // Chart 2: Pie — seeds vs tools
  const pieData = [
    { name: "Seeds Budget", value: totalSeedsBudget },
    { name: "Tools Budget", value: totalToolsBudget },
  ];

  // Chart 3: Beneficiaries per village (horizontal bar)
  const beneficiaryData = clusterSummaries.map((c, i) => ({
    cluster: c.cluster.replace("Cluster ", "C"),
    Beneficiaries: c.beneficiaries,
    fill: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
  }));

  // Chart 4: Efficiency — UGX per beneficiary (top 6)
  const efficiencyData = efficiency.slice(0, 6).map((e) => ({
    village: e.village.length > 8 ? e.village.slice(0, 8) + "…" : e.village,
    "UGX/Beneficiary": e.perBeneficiary,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
      {/* Chart 1 — Budget by Cluster */}
      <ChartCard
        title="Budget by Cluster"
        subtitle="Seeds vs Tools budget breakdown per cluster"
        isLoading={isLoading}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={clusterData} barCategoryGap="30%" barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="cluster"
              tick={{ fontSize: 12, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMillions}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: axisColor }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Seeds Budget" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Tools Budget" fill="#e65100" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2 — Pie */}
      <ChartCard
        title="Budget Distribution"
        subtitle="Overall seeds vs tools budget split"
        isLoading={isLoading}
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
              ))}
              <LabelList
                dataKey="value"
                position="outside"
                formatter={labelMillions}
                style={{ fontSize: 11, fill: axisColor }}
              />
            </Pie>
            <Tooltip
              formatter={pieTooltipFormatter}
              contentStyle={{
                background: "var(--bg-surface)",
                border: "1px solid var(--divider)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: axisColor }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 3 — Beneficiaries per cluster */}
      <ChartCard
        title="Beneficiaries by Cluster"
        subtitle="Total households reached per cluster"
        isLoading={isLoading}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={beneficiaryData}
            layout="vertical"
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="cluster"
              type="category"
              tick={{ fontSize: 12, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              }}
            />
            <Bar dataKey="Beneficiaries" radius={[0, 4, 4, 0]}>
              {beneficiaryData.map((_, i) => (
                <Cell
                  key={i}
                  fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 4 — Efficiency */}
      <ChartCard
        title="Budget Efficiency"
        subtitle="UGX spent per beneficiary by village (top 6)"
        isLoading={isLoading}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={efficiencyData} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="village"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMillions}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              }}
            />
            <Bar dataKey="UGX/Beneficiary" fill="#1976d2" radius={[4, 4, 0, 0]}>
              {efficiencyData.map((_, i) => (
                <Cell
                  key={i}
                  fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
