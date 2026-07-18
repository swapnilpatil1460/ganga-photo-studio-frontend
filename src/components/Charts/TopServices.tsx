import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export interface ServiceData {
  name: string;
  value: number;
}

interface TopServicesProps {
  data: ServiceData[];
  isLoading?: boolean;
}

const COLORS = ["#c9a15a", "#a38045", "#7d602f", "#57421c", "#3c2e14"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#000", border: "1px solid #333", color: "#f8fafc", padding: "10px 14px",
        borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: payload[0].payload.fill }} />
          <span style={{ color: "#e2e8f0" }}>
            {payload[0].name}: <span style={{ fontWeight: 600 }}>{payload[0].value} Orders</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const TopServices: React.FC<TopServicesProps> = ({ data, isLoading }) => {
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: "16px", padding: "20px", border: "1px solid #333",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)", height: "100%"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          Top Services
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--theme-text-muted)" }}>
          Most requested photography services
        </p>
      </div>

      {isLoading ? (
        <div style={{ height: 260, background: "#333", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-text-muted)", fontSize: "14px" }}>
          No service data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "var(--theme-text-muted)" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopServices;
