import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: string;
  isLoading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color = "#c9a15a", // Default to Gold
  isLoading = false,
}) => {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "#22c55e"
      : trend === "down"
      ? "#ef4444"
      : "#94a3b8";

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: "16px",
        padding: "20px 24px",
        border: "1px solid #333",
        borderLeft: `4px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minHeight: "120px",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--theme-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </span>
        {icon && (
          <div style={{ background: `${color}15`, borderRadius: "10px", padding: "8px", color }}>
            {icon}
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ height: "32px", background: "#333", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
      ) : (
        <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
          {value}
        </span>
      )}

      {(trend || subtitle) && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
          {trend && (
            <>
              <TrendIcon size={13} color={trendColor} />
              <span style={{ fontSize: "12px", color: trendColor, fontWeight: 600 }}>
                {trendLabel}
              </span>
            </>
          )}
          {subtitle && (
            <span style={{ fontSize: "12px", color: "var(--theme-text-muted)" }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
