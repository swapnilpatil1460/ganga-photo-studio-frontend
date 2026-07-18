import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const ReportsPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ 
    start: new Date().toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  
  const role = localStorage.getItem('role');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Pass start and end date to backend
      const res = await fetch(`http://localhost:5000/api/orders?startDate=${dateRange.start}&endDate=${dateRange.end}T23:59:59.999Z`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("No data available to export for this date range.");
      return;
    }

    // Define CSV Headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Phone",
      "Service",
      "Priority",
      "Status",
      "Order Date",
      "Expected Delivery",
      "Total Spent (INR)",
      "Amount Paid (INR)",
      "Remaining Due (INR)"
    ];

    // Map rows
    const rows = orders.map(order => {
      const cName = typeof order.customer === 'object' ? (order.customer?.name || 'Walk-in') : 'Walk-in';
      const cPhone = typeof order.customer === 'object' ? (order.customer?.phone || 'N/A') : 'N/A';
      const total = order.totalAmount || 0;
      const paid = order.paidAmount || 0;
      const due = total - paid;
      
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const expectedDate = new Date(order.expectedDeliveryDate).toLocaleDateString();

      return [
        order.orderId,
        `"${cName}"`, // Escape commas in names
        cPhone,
        order.service,
        order.priority || 'Normal',
        order.status,
        orderDate,
        expectedDate,
        total,
        paid,
        due
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GangaStudio_Report_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (role !== 'owner') {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 flex-col gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-lg">You do not have permission to view financial reports.</p>
      </div>
    );
  }

  // Calculate Aggregates
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCollected = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  const totalDue = totalRevenue - totalCollected;

  return (
    <div className="page-container max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pb-12 pr-2">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-1">Financial & Operations Reports</h1>
          <p className="text-gray-600 text-sm">Export customer and order data for accounting and analysis.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={18} /> Export as CSV
        </button>
      </div>

      <div className="profile-card mb-8">
        <h3 className="font-semibold text-[var(--theme-text)] flex items-center gap-2 mb-6 pb-3 border-b border-[var(--theme-border)]">
          <Filter size={18} className="text-yellow-500" /> Filter Report Data
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="profile-card flex flex-col justify-center">
          <h4 className="text-sm font-medium text-[var(--theme-text-muted)] mb-1">Total Revenue</h4>
          <p className="text-3xl font-bold text-[var(--theme-text)]">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-2">Booked in this period</p>
        </div>
        <div className="profile-card flex flex-col justify-center">
          <h4 className="text-sm font-medium text-[var(--theme-text-muted)] mb-1">Total Collected</h4>
          <p className="text-3xl font-bold text-green-400">₹{totalCollected.toLocaleString()}</p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-2">Paid towards these orders</p>
        </div>
        <div className="profile-card flex flex-col justify-center">
          <h4 className="text-sm font-medium text-[var(--theme-text-muted)] mb-1">Total Remaining Due</h4>
          <p className="text-3xl font-bold text-red-400">₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-2">Outstanding balance</p>
        </div>
      </div>

      {/* Preview Table */}
      <div className="table-container">
        <div className="p-4 bg-[var(--theme-bg-main)] border-b border-[var(--theme-border)] flex justify-between items-center">
          <h3 className="font-medium text-[var(--theme-text)]">Data Preview</h3>
          <span className="text-sm text-[var(--theme-text-muted)]">{orders.length} record(s) found</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading report data...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No orders found for this date range.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Order Date</th>
                <th>Expected Delivery</th>
                <th>Total</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const due = (order.totalAmount || 0) - (order.paidAmount || 0);
                return (
                  <tr key={order._id}>
                    <td className="font-mono text-sm text-gray-600">{order.orderId}</td>
                    <td className="font-medium">{typeof order.customer === 'object' ? order.customer?.name : 'Walk-in'}</td>
                    <td>{order.service}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</td>
                    <td className="font-medium">₹{(order.totalAmount || 0).toLocaleString()}</td>
                    <td className={`font-bold ${due > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ₹{due.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ReportsPage;
