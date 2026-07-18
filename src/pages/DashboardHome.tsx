import React, { useEffect, useState } from 'react';
import { Camera, Users, IndianRupee, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import SummaryCard from '../components/Charts/SummaryCard';
import RevenueChart from '../components/Charts/RevenueChart';
import DailyRevenueChart from '../components/Charts/DailyRevenueChart';
import CustomerChart from '../components/Charts/CustomerChart';
import TopServices from '../components/Charts/TopServices';

const DashboardHome = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/orders/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupees = (val: number) => {
    if (val === undefined || val === null) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ minHeight: "100%", padding: "0" }}>
      {/* Header section matching Kallyankar structure but Ganga theme */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
        padding: "24px 32px",
        borderBottom: "1px solid #333",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#fff" }}>
            Studio Overview
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--theme-text-muted)" }}>
            Ganga Photo Studio — Live Business Analytics
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 16px", borderRadius: "8px",
            background: loading ? "#333" : "#c9a15a",
            color: loading ? "#999" : "#1a1a1a", 
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px", fontWeight: 600, transition: "background 0.2s",
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {error && (
          <div style={{
            background: "#500", border: "1px solid #f00", borderRadius: "12px",
            padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px", color: "#f87171",
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: "14px", fontWeight: 600 }}>
              {error}. Please check your API connection.
            </span>
          </div>
        )}

        {/* Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          {/* 1. Today's Revenue */}
          <SummaryCard
            title="Today's Revenue"
            value={data ? formatRupees(data.revenueToday) : '₹0'}
            icon={<IndianRupee size={22} />}
            trend="up"
            color="#c9a15a"
            isLoading={loading}
          />
          {/* 2. Monthly Revenue */}
          <SummaryCard
            title="Monthly Revenue"
            value={data ? formatRupees(data.revenueThisMonth) : '₹0'}
            icon={<IndianRupee size={22} />}
            trend="up"
            color="#10b981"
            isLoading={loading}
          />
          {/* 3. Active Employees */}
          <SummaryCard
            title="Active Employees"
            value={data ? data.activeEmployees : '0'}
            icon={<Users size={22} />}
            color="#8b5cf6"
            isLoading={loading}
          />
          {/* 4. Total Customers */}
          <SummaryCard
            title="Total Customers"
            value={data ? data.totalOrders : '0'} 
            icon={<Users size={22} />}
            color="#3b82f6"
            isLoading={loading}
          />
          {/* 5. Pending Payments */}
          <SummaryCard
            title="Pending Payments"
            value={data ? formatRupees(data.pendingPayments) : '₹0'}
            icon={<AlertCircle size={22} />}
            color="#ef4444"
            isLoading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px"
        }}>
          <div>
            <DailyRevenueChart data={data?.dailyRevenue || []} isLoading={loading} />
          </div>
          <div>
            <RevenueChart data={data?.monthlyRevenue || []} isLoading={loading} />
          </div>
          <div>
            <CustomerChart data={data?.monthlyCustomers || []} isLoading={loading} />
          </div>
          <div>
            <TopServices data={data?.topServices || []} isLoading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
