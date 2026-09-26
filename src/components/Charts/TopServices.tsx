import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface ServiceData { name: string; value: number; }

interface TopServicesProps { isDark?: boolean; data: ServiceData[]; isLoading?: boolean; }

const TopServices: React.FC<TopServicesProps> = ({ isDark = true, data, isLoading }) => {
  const COLORS_DARK = ["#c9a15a", "#a38045", "#7d602f", "#57421c", "#3c2e14"];
  const COLORS_LIGHT = ["#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"];
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e2e8f0";
  const titleColor = isDark ? "#ffffff" : "#334155";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const skeletonBg = isDark ? "#333" : "#e2e8f0";
  const tooltipBg = isDark ? "#000" : "#1e293b";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) return (
      <div style={{ background: tooltipBg, border: `1px solid ${border}`, color: "#f8fafc", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: payload[0].payload.fill }} />
          <span style={{ color: "#e2e8f0" }}>
            {payload[0].name}: <span style={{ fontWeight: 600 }}>{payload[0].value} Orders</span>
          </span>
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{ background: bg, borderRadius: "16px", padding: "20px", border: `1px solid ${border}`, height: "100%" }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: titleColor }}>Top Services</h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: mutedColor }}>Most requested photography services</p>
      </div>
      {isLoading ? (
        <div style={{ height: 260, background: skeletonBg, borderRadius: "12px" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: mutedColor, fontSize: "14px" }}>No service data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: mutedColor }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopServices;
