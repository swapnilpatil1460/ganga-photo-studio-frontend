import React, { useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";

interface ActivityLog {
  _id: string;
  email: string;
  action: string;
  details: string;
  createdAt: string;
}

interface ActivityTimelineProps {
  isDark?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ isDark = true }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/activity?limit=10', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error('Failed to fetch activity logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e2e8f0";
  const titleColor = isDark ? "#ffffff" : "#334155";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const skeletonBg = isDark ? "#333" : "#e2e8f0";

  return (
    <div style={{ background: bg, borderRadius: "16px", padding: "20px", border: `1px solid ${border}`, height: "100%", gridColumn: '1 / -1' }}>
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Activity size={18} color={isDark ? "#c9a15a" : "#0ea5e9"} />
        <div>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: titleColor }}>Recent Activity</h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: mutedColor }}>Latest employee actions and logins</p>
        </div>
      </div>
      
      {loading ? (
        <div style={{ height: 260, background: skeletonBg, borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      ) : logs.length === 0 ? (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: mutedColor, fontSize: "14px" }}>No activity recorded yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
          {logs.map((log) => {
            const date = new Date(log.createdAt);
            const isToday = new Date().toDateString() === date.toDateString();
            const timeString = isToday 
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={log._id} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDark ? "#c9a15a" : "#0ea5e9", boxShadow: `0 0 0 4px ${isDark ? '#333' : '#f1f5f9'}` }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: titleColor }}>{log.email}</span>
                    <span style={{ fontSize: '11px', color: mutedColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {timeString}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: isDark ? '#d1d5db' : '#475569' }}>
                    {log.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
