import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Customer {
  _id: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers?page=${page}&limit=${limit}`;
      
      if (search) {
        // Simple heuristic: if it looks like a number, search by phone, else by name
        if (/^\d+$/.test(search)) {
          url += `&phone=${search}`;
        } else {
          url += `&name=${search}`;
        }
      }
      
      if (dateFilter) {
        url += `&dateFilter=${dateFilter}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setCustomers(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, dateFilter, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VIP': return <span className="badge badge-gold">VIP</span>;
      case 'ACTIVE': return <span className="badge badge-green">ACTIVE</span>;
      case 'INACTIVE': return <span className="badge badge-gray">INACTIVE</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customer List</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/dashboard/customers/new')}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="table-controls flex-col md:flex-row flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1 w-full md:w-auto">
          <div className="search-wrapper flex-1 max-w-md">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="search-input"
            />
          </div>
          <div className="filter-wrapper relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
            <input 
              type="date"
              className="search-input pl-10 appearance-none cursor-pointer"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        
        <button className="btn-outline flex items-center gap-2 mt-4 md:mt-0" onClick={() => { setSearch(''); setDateFilter(''); setPage(1); fetchCustomers(); }}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading customers...</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? customers.map(customer => (
                  <tr 
                    key={customer._id} 
                    onClick={() => navigate(`/dashboard/customers/${customer._id}`)}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="text-gray-600 font-mono text-sm">{customer.customerId}</td>
                    <td className="font-medium text-gray-900">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{getStatusBadge(customer.status)}</td>
                    <td>{customer.totalOrders}</td>
                    <td>₹{(customer.totalSpent || 0).toLocaleString()}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button className="action-btn view" title="View Profile" onClick={() => navigate(`/dashboard/customers/${customer._id}`)}>
                          <Eye size={18} />
                        </button>
                        <button className="action-btn edit" title="Edit" onClick={() => navigate(`/dashboard/customers/${customer._id}/edit`)}>
                          <Edit2 size={18} />
                        </button>
                        <button className="action-btn delete" title="Delete" onClick={() => handleDelete(customer._id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg">No customers found.</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button 
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
