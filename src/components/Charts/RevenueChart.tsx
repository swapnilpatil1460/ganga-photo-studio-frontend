import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface MonthlyData { month: string; value: number; }

interface RevenueChartProps { isDark?: boolean; data: MonthlyData[]; isLoading?: boolean; }

const formatRupees = (v: number) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(1)}K` : `₹${v}`;

const RevenueChart: React.FC<RevenueChartProps> = ({ isDark = true, data, isLoading }) => {
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e2e8f0";
  const titleColor = isDark ? "#ffffff" : "#334155";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#333" : "#e2e8f0";
  const skeletonBg = isDark ? "#333" : "#e2e8f0";
  const accentColor = isDark ? "#c9a15a" : "#0ea5e9";
  const tooltipBg = isDark ? "#000" : "#1e293b";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div style={{ background: tooltipBg, border: `1px solid ${border}`, color: "#f8fafc", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
        <p style={{ margin: 0, fontWeight: 700, color: mutedColor }}>{label}</p>
        <p style={{ margin: "4px 0 0", color: accentColor }}>Revenue: ₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
    return null;
  };

  return (
    <div style={{ background: bg, borderRadius: "16px", padding: "20px", border: `1px solid ${border}` }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: titleColor }}>Monthly Revenue</h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: mutedColor }}>Total billed amount collected per month</p>
      </div>
      {isLoading ? (
        <div style={{ height: 260, background: skeletonBg, borderRadius: "12px" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: mutedColor, fontSize: "14px" }}>No revenue data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: mutedColor } as any} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatRupees} tick={{ fontSize: 11, fill: mutedColor } as any} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke={accentColor} strokeWidth={2.5} fill="url(#revGrad)" activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
