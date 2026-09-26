import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface MonthlyCustomerData { month: string; new: number; returning: number; }

interface CustomerChartProps { isDark?: boolean; data: MonthlyCustomerData[]; isLoading?: boolean; }

const CustomerChart: React.FC<CustomerChartProps> = ({ isDark = true, data, isLoading }) => {
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
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: mutedColor }}>{label}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color }} />
              <span style={{ color: "#e2e8f0" }}>
                {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{ background: bg, borderRadius: "16px", padding: "20px", border: `1px solid ${border}`, height: "100%" }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: titleColor }}>Customer Acquisition</h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: mutedColor }}>New vs Returning Customers over time</p>
      </div>
      {isLoading ? (
        <div style={{ height: 260, background: skeletonBg, borderRadius: "12px" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: mutedColor, fontSize: "14px" }}>No customer data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: mutedColor } as any} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: mutedColor } as any} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: gridColor, opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: "12px", color: mutedColor }} />
            <Bar dataKey="new" name="New Customers" stackId="a" fill={accentColor} radius={[0, 0, 4, 4]} />
            <Bar dataKey="returning" name="Returning" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomerChart;
