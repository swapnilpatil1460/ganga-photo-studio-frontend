import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export interface MonthlyCustomerData {
  month: string;
  new: number;
  returning: number;
}

interface CustomerChartProps {
  data: MonthlyCustomerData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#000", border: "1px solid #333", color: "#f8fafc", padding: "10px 14px",
        borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
      }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: "var(--theme-text-muted)" }}>{label}</p>
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
  }
  return null;
};

const CustomerChart: React.FC<CustomerChartProps> = ({ data, isLoading }) => {
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: "16px", padding: "20px", border: "1px solid #333",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)", height: "100%"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          Customer Acquisition
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--theme-text-muted)" }}>
          New vs Returning Customers over time
        </p>
      </div>

      {isLoading ? (
        <div style={{ height: 260, background: "#333", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-text-muted)", fontSize: "14px" }}>
          No customer data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--theme-text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--theme-text-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#333", opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "var(--theme-text-muted)" }} />
            <Bar dataKey="new" name="New Customers" stackId="a" fill="#c9a15a" radius={[0, 0, 4, 4]} />
            <Bar dataKey="returning" name="Returning" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomerChart;
