import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface MonthlyData {
  month: string;
  value: number;
}

interface RevenueChartProps {
  data: MonthlyData[];
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
        background: "#000", border: "1px solid #333", color: "#f8fafc", padding: "10px 14px",
        borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--theme-text-muted)" }}>{label}</p>
        <p style={{ margin: "4px 0 0", color: "#c9a15a" }}>
          Revenue: ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: "16px", padding: "20px", border: "1px solid #333",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          Monthly Revenue
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--theme-text-muted)" }}>
          Total billed amount collected per month
        </p>
      </div>

      {isLoading ? (
        <div style={{ height: 260, background: "#333", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-text-muted)", fontSize: "14px" }}>
          No revenue data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a15a" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c9a15a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--theme-text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatRupees} tick={{ fontSize: 11, fill: "var(--theme-text-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#c9a15a"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={{ fill: "#c9a15a", r: 4, strokeWidth: 2, stroke: "#1a1a1a" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
