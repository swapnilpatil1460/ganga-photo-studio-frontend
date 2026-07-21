import React, { useState, useEffect } from 'react';
import {  Search, Filter, Loader, AlertCircle, Package, CheckCircle2, Clock, IndianRupee, Eye, Calendar, User, BarChart3 , RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderAnalytics {
  totalOrders: number;
  todaysOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenueToday: number;
  revenueThisMonth: number;
}

interface Order {
  _id: string;
  orderId: string;
  customer: any;
  service: string;
  assignedEmployee: string;
  totalAmount: number;
  paidAmount?: number;
  status: string;
  priority: string;
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showUnpaid, setShowUnpaid] = useState(false);

  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (employeeFilter) params.append('employee', employeeFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const [ordersRes, analyticsRes, empRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders?${params.toString()}`, { headers }),
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/orders/analytics', { headers }),
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/employees?limit=100&t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' } })
      ]);

      if (ordersRes.ok) {
        const result = await ordersRes.json();
        setOrders(result.data || result);
      }
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (empRes.ok) {
        const result = await empRes.json();
        setEmployeesList(result.data || result);
      }
    } catch (err) {
      console.error('Error fetching orders data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, employeeFilter, dateRange]); // Refetch on filter change

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const getCustomerName = (customerField: any) => {
    if (!customerField) return 'Unknown Customer';
    if (typeof customerField === 'string') return 'Walk-in';
    return customerField.name;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Received': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Assigned': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Editing': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Printing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Ready': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Normal': return 'text-green-400';
      case 'Low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const handleTotalClick = () => {
    setStatusFilter('');
    setDateRange({ start: '', end: '' });
    setShowUnpaid(false);
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setStatusFilter('');
    setDateRange({ start: today, end: today });
    setShowUnpaid(false);
  };

  const handlePendingClick = () => {
    setStatusFilter('Pending');
    setDateRange({ start: '', end: '' });
    setShowUnpaid(false);
  };

  const handleCompletedClick = () => {
    setStatusFilter('Delivered');
    setDateRange({ start: '', end: '' });
    setShowUnpaid(false);
  };

  const handleUnpaidClick = () => {
    setDateRange({ start: '', end: '' });
    setShowUnpaid(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Global Orders</h1>
      </div>

      {/* Filter Bar */}
      <div className="table-controls flex-col md:flex-row flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 flex-1 w-full flex-wrap items-center">
          <div className="search-wrapper flex-1 max-w-xs">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-wrapper relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
            <select 
              className="search-input pl-10 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Assigned">Assigned</option>
              <option value="Editing">Editing</option>
              <option value="Printing">Printing</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-wrapper relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
            <select 
              className="search-input pl-10 appearance-none cursor-pointer"
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
            >
              <option value="">All Employees</option>
              {employeesList.map(emp => (
                <option key={emp._id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-wrapper relative flex items-center gap-2">
             <input 
                type="date" 
                className="search-input"
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                title="Start Date"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                className="search-input"
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                title="End Date"
              />
          </div>

          <button type="submit" className="btn-outline flex items-center gap-2 ml-auto" title="Refresh">
            <RefreshCw size={18} /> Refresh
          </button>
        </form>
      </div>

      {/* Analytics Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${statusFilter === '' && dateRange.start === '' ? 'active' : ''}`}
          onClick={handleTotalClick}
        >
          All Orders
        </button>
        <button 
          className={`tab-btn ${dateRange.start !== '' && dateRange.start === dateRange.end ? 'active' : ''}`}
          onClick={handleTodayClick}
        >
          Today's Orders
        </button>
        <button 
          className={`tab-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={handlePendingClick}
        >
          Pending
        </button>
        <button 
          className={`tab-btn ${statusFilter === 'Delivered' && !showUnpaid ? 'active' : ''}`}
          onClick={handleCompletedClick}
        >
          Completed
        </button>
        {role === 'owner' && (
          <button 
            className={`tab-btn ${showUnpaid ? 'active' : ''}`}
            onClick={handleUnpaidClick}
          >
            Unpaid Amounts
          </button>
        )}
      </div>

      {/* Advanced Data Table */}
      <div className="table-container">
        {showUnpaid && role === 'owner' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Unpaid Orders</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Remaining Amount</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const unpaidMap = new Map();
                orders.forEach(o => {
                  const rem = (o.totalAmount || 0) - (o.paidAmount || 0);
                  if (rem > 0) {
                    const cId = typeof o.customer === 'object' ? (o.customer?._id || 'unknown') : (o.customer || 'unknown');
                    const cName = typeof o.customer === 'object' ? (o.customer?.name || 'Walk-in') : 'Walk-in';
                    if (!unpaidMap.has(cId)) unpaidMap.set(cId, { id: cId, name: cName, count: 0, total: 0, paid: 0, rem: 0 });
                    const entry = unpaidMap.get(cId);
                    entry.count += 1;
                    entry.total += (o.totalAmount || 0);
                    entry.paid += (o.paidAmount || 0);
                    entry.rem += rem;
                  }
                });
                const unpaidList = Array.from(unpaidMap.values());
                if (unpaidList.length === 0) {
                  return <tr><td colSpan={5} style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>No unpaid customers found.</td></tr>;
                }
                return unpaidList.map((cust, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--theme-bg)' }}>
                          <User size={12} style={{ color: 'var(--theme-text-muted)' }} />
                        </div>
                        <span className="text-sm font-medium">{cust.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{cust.count} Order(s)</span></td>
                    <td className="font-medium">₹{cust.total.toLocaleString()}</td>
                    <td className="font-medium text-green-500">₹{cust.paid.toLocaleString()}</td>
                    <td className="font-bold text-red-500">₹{cust.rem.toLocaleString()}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Assigned To</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{textAlign: 'center', padding: '3rem'}}>
                    <Loader className="animate-spin text-yellow-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <span className="font-mono text-sm font-bold text-yellow-500">{order.orderId}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--theme-bg)' }}>
                          <User size={12} style={{ color: 'var(--theme-text-muted)' }} />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {getCustomerName(order.customer)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm truncate max-w-[150px] block" style={{ color: 'var(--theme-text-muted)' }}>{order.service}</span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{order.assignedEmployee || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span className="font-medium text-sm">₹{(order.totalAmount || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="font-medium text-sm text-green-500">₹{(order.paidAmount || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`text-xs font-bold ${getPriorityColor(order.priority || 'Normal')}`}>
                        {order.priority || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--theme-text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                          className="action-btn view"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
