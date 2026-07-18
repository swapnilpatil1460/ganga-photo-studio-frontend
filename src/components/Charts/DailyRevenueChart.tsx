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

const DailyRevenueChart: React.FC<DailyRevenueChartProps> = ({ data, isLoading }) => {
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: "16px", padding: "20px", border: "1px solid #333",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          Daily Revenue
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--theme-text-muted)" }}>
          Revenue collected over the last 7 days
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
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--theme-text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatRupees} tick={{ fontSize: 11, fill: "var(--theme-text-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#333", opacity: 0.4 }} />
            <Bar dataKey="value" name="Revenue" fill="#c9a15a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailyRevenueChart;
