import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, IndianRupee, RefreshCw, AlertCircle } from 'lucide-react';
import SummaryCard from '../components/Charts/SummaryCard';
import RevenueChart from '../components/Charts/RevenueChart';
import DailyRevenueChart from '../components/Charts/DailyRevenueChart';
import CustomerChart from '../components/Charts/CustomerChart';
import TopServices from '../components/Charts/TopServices';
import ActivityTimeline from '../components/Charts/ActivityTimeline';

const DashboardHome = () => {
  const { theme } = useOutletContext<{ theme: string }>();
  const isDark = theme === 'theme-dashboard';
  const role = localStorage.getItem('role') || 'employee';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/analytics', {
        credentials: 'include',
        headers: {}
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

  useEffect(() => { fetchData(); }, []);

  const formatRupees = (val: number) => {
    if (val === undefined || val === null) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Colors based on current theme
  const headerBg = isDark
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  const headerBorder = isDark ? '#333' : '#e2e8f0';
  const headerText = isDark ? '#ffffff' : '#334155';
  const headerSubText = isDark ? '#94a3b8' : '#64748b';
  const btnBg = isDark ? '#c9a15a' : '#0ea5e9';
  const btnLoadingBg = isDark ? '#333' : '#e2e8f0';
  const btnLoadingColor = isDark ? '#999' : '#64748b';

  return (
    <div style={{ minHeight: '100%', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: headerBg,
        padding: '24px 32px',
        borderBottom: `1px solid ${headerBorder}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: headerText }}>
            Studio Overview
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: headerSubText }}>
            Ganga Photo Studio — Live Business Analytics
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            background: loading ? btnLoadingBg : btnBg,
            color: loading ? btnLoadingColor : '#fff',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: '12px',
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171',
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {error}. Please check your API connection.
            </span>
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <SummaryCard isDark={isDark} title="Today's Revenue" value={data ? formatRupees(data.revenueToday) : '₹0'} icon={<IndianRupee size={22} />} trend="up" color="#c9a15a" isLoading={loading} />
          <SummaryCard isDark={isDark} title="Monthly Revenue" value={data ? formatRupees(data.revenueThisMonth) : '₹0'} icon={<IndianRupee size={22} />} trend="up" color="#10b981" isLoading={loading} />
          <SummaryCard isDark={isDark} title="Active Employees" value={data ? data.activeEmployees : '0'} icon={<Users size={22} />} color="#8b5cf6" isLoading={loading} />
          <SummaryCard isDark={isDark} title="Total Customers" value={data ? data.totalOrders : '0'} icon={<Users size={22} />} color="#3b82f6" isLoading={loading} />
          <SummaryCard isDark={isDark} title="Pending Payments" value={data ? formatRupees(data.pendingPayments) : '₹0'} icon={<AlertCircle size={22} />} color="#ef4444" isLoading={loading} />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <DailyRevenueChart isDark={isDark} data={data?.dailyRevenue || []} isLoading={loading} />
          <RevenueChart isDark={isDark} data={data?.monthlyRevenue || []} isLoading={loading} />
          <CustomerChart isDark={isDark} data={data?.monthlyCustomers || []} isLoading={loading} />
          <TopServices isDark={isDark} data={data?.topServices || []} isLoading={loading} />
          {role === 'owner' && <ActivityTimeline isDark={isDark} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;



