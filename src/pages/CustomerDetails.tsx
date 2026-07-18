import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, MapPin, Phone, Mail, Calendar, Shield, ShoppingCart, DollarSign, Package } from 'lucide-react';
import type { Customer } from './Customers';
import OrdersTab from '../components/OrdersTab';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'invoices' | 'activity'>('overview');

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-600">Loading profile...</div>;
  if (!customer) return <div className="p-8 text-red-500">Customer not found.</div>;

  return (
    <div className="page-container">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors" onClick={() => navigate('/dashboard/customers')}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              {customer.status === 'VIP' && <span className="badge badge-gold">VIP</span>}
              {customer.status === 'ACTIVE' && <span className="badge badge-green">ACTIVE</span>}
              {customer.status === 'INACTIVE' && <span className="badge badge-gray">INACTIVE</span>}
            </div>
            <p className="text-gray-600 font-mono text-sm">{customer.customerId}</p>
          </div>
        </div>
        
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate(`/dashboard/customers/${id}/edit`)}>
          <Edit2 size={18} /> Edit Profile
        </button>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="profile-card col-span-1">
              <h3 className="card-title mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
                <Shield size={20} className="text-yellow-500" /> Customer Information
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="info-row">
                  <Phone size={18} className="text-gray-600" />
                  <div>
                    <p className="info-label">Phone Number</p>
                    <p className="info-value">{customer.phone}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <Mail size={18} className="text-gray-600" />
                  <div>
                    <p className="info-label">Email Address</p>
                    <p className="info-value">{customer.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <MapPin size={18} className="text-gray-600" />
                  <div>
                    <p className="info-label">Address</p>
                    <p className="info-value">{customer.address || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <Calendar size={18} className="text-gray-600" />
                  <div>
                    <p className="info-label">Member Since</p>
                    <p className="info-value">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {customer.notes && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="info-label mb-2">Notes</p>
                  <p className="text-sm text-gray-500 p-3 rounded-lg border border-gray-200">{customer.notes}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-4 col-span-1 lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon"><ShoppingCart size={24} /></div>
                  </div>
                  <h3 className="stat-title">Total Orders</h3>
                  <p className="stat-value">{customer.totalOrders}</p>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon"><DollarSign size={24} /></div>
                  </div>
                  <h3 className="stat-title">Total Revenue</h3>
                  <p className="stat-value text-yellow-500">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon"><Package size={24} /></div>
                  </div>
                  <h3 className="stat-title">Completed Orders</h3>
                  <p className="stat-value">--</p>
                  <p className="text-xs text-gray-500 mt-2">Available in Phase 3</p>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon"><Calendar size={24} /></div>
                  </div>
                  <h3 className="stat-title">Pending Orders</h3>
                  <p className="stat-value">--</p>
                  <p className="text-xs text-gray-500 mt-2">Available in Phase 3</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <OrdersTab customerId={id as string} onOrderCreated={fetchCustomer} />
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Invoices</h3>
            <p className="text-gray-600 mb-6">Select an invoice below to view or print it.</p>
            <OrdersTab customerId={id as string} onOrderCreated={fetchCustomer} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Stream</h3>
            <p className="text-gray-600 max-w-md mx-auto">A unified timeline of all customer interactions, emails, and system events will appear here in the CRM expansion phase.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
