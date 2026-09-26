import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface DailyData {
  day: string;
  value: number;
}

interface DailyRevenueChartProps {
  data: DailyData[];
  isLoading?: boolean;
}

const formatRupees = (value: number) => {
  if (value === undefined || value === null) return '₹0';
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--theme-chart-tooltip-bg, #000)",
        border: "1px solid var(--theme-chart-border, #333)",
        color: "var(--theme-chart-tooltip-color, #f8fafc)",
        padding: "10px 14px",
        borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--theme-text-muted)" }}>{label}</p>
        <p style={{ margin: "4px 0 0", color: "var(--color-yellow-500, #c9a15a)" }}>
          Revenue: ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const DailyRevenueChart: React.FC<DailyRevenueChartProps> = ({ data, isLoading }) => {
  return (
    <div style={{
      background: "var(--theme-chart-bg, #1a1a1a)", borderRadius: "16px", padding: "20px",
      border: "1px solid var(--theme-chart-border, #333)", boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--theme-text)" }}>
          Daily Revenue
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--theme-text-muted)" }}>
          Revenue collected over the last 7 days
        </p>
      </div>

      {isLoading ? (
        <div style={{ height: 260, background: "var(--theme-skeleton, #333)", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-text-muted)", fontSize: "14px" }}>
          No revenue data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-chart-grid, #333)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--theme-text-muted)" as any }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatRupees} tick={{ fontSize: 11, fill: "var(--theme-text-muted)" as any }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--theme-chart-grid, #333)", opacity: 0.4 }} />
            <Bar dataKey="value" name="Revenue" fill="var(--color-yellow-500, #c9a15a)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailyRevenueChart;
