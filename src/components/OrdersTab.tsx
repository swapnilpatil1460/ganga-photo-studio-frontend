import React, { useState, useEffect } from 'react';
import { Plus, X, Package, Eye, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrdersTabProps {
  customerId: string;
  onOrderCreated: () => void;
}

const OrdersTab = ({ customerId, onOrderCreated }: OrdersTabProps) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer: customerId,
    service: 'Photography',
    quantity: 1,
    price: 0,
    expectedDeliveryDate: new Date().toISOString().split('T')[0],
    priority: 'Normal',
    assignedEmployee: '',
    paidAmount: 0
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch orders for this specific customer
      // Since backend doesn't have a direct /customers/:id/orders route,
      // we can fetch all orders and filter, or just use the global search if supported.
      // We will just fetch all and filter in frontend for this demo if backend doesn't support customer filter.
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter by customerId
        const custOrders = data.filter((o: any) => 
          (typeof o.customer === 'string' ? o.customer === customerId : o.customer?._id === customerId)
        );
        setOrders(custOrders);
      }
      
      const empRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (empRes.ok) setEmployeesList(await empRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...orderForm,
          totalAmount: orderForm.quantity * orderForm.price
        })
      });
      if (res.ok) {
        const result = await res.json();
        const newOrder = result.data || result;
        setShowModal(false);
        setOrderForm({ ...orderForm, service: 'Photography', quantity: 1, price: 0, expectedDeliveryDate: '', priority: 'Normal', assignedEmployee: '' });
        fetchOrders();
        onOrderCreated(); // Update revenue stats in parent
        
        // Automatically navigate to the print invoice screen for the new order!
        if (newOrder && newOrder._id) {
          navigate(`/dashboard/invoices/${newOrder._id}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Create Order
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600 p-8 text-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">This customer hasn't placed any orders yet.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors border border-gray-300"
          >
            Create their first order
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Service</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr 
                  key={order._id}
                  onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                  className="cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="font-mono text-sm font-bold text-yellow-500">{order.orderId}</td>
                  <td className="font-medium">{order.service}</td>
                  <td className="font-bold">₹{(order.totalAmount || 0).toLocaleString()}</td>
                  <td className="font-medium text-green-500">₹{(order.paidAmount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button 
                        className="action-btn view" 
                        title="View Details" 
                        onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="action-btn edit" 
                        title="Print Invoice" 
                        onClick={() => navigate(`/dashboard/invoices/${order._id}`)}
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="form-card p-0 w-full max-w-xl shadow-2xl animate-fade-in flex flex-col" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: 'var(--theme-border)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>Create Order for Customer</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--theme-text-muted)' }} className="hover:opacity-75">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Service Type *</label>
                  <select 
                    required
                    className="search-input w-full appearance-none"
                    value={orderForm.service}
                    onChange={e => setOrderForm({...orderForm, service: e.target.value})}
                  >
                    <option value="Flex Printing">Flex Printing</option>
                    <option value="Photographer Flex Printing">Photographer Flex Printing</option>
                    <option value="Identity / Passport Photo">Identity / Passport Photo</option>
                    <option value="Photography">Photography</option>
                    <option value="CopingPhoto">CopingPhoto</option>
                    <option value="Mobile Print">Mobile Print</option>
                    <option value="Photo Dream">Photo Dream</option>
                    <option value="Lamination">Lamination</option>
                    <option value="Photo Album">Photo Album</option>
                    <option value="Trophy">Trophy</option>
                    <option value="Mug Printing">Mug Printing</option>
                    <option value="Soft Copy/Digital Bord Photo">Soft Copy/Digital Bord Photo</option>
                    <option value="Wedding Album">Wedding Album</option>
                    <option value="Video Shooting">Video Shooting</option>
                    <option value="Pre./After Wedding">Pre./After Wedding</option>
                    <option value="Drone">Drone</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Priority</label>
                  <select 
                    className="search-input w-full appearance-none"
                    value={orderForm.priority}
                    onChange={e => setOrderForm({...orderForm, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Quantity</label>
                  <input 
                    type="number" min="1" required
                    className="search-input w-full"
                    value={orderForm.quantity}
                    onChange={e => setOrderForm({...orderForm, quantity: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Price per unit (₹)</label>
                  <input 
                    type="number" min="0" required
                    className="search-input w-full"
                    value={orderForm.price}
                    onChange={e => setOrderForm({...orderForm, price: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Expected Delivery Date</label>
                  <input 
                    type="date" required
                    className="search-input w-full"
                    value={orderForm.expectedDeliveryDate}
                    onChange={e => setOrderForm({...orderForm, expectedDeliveryDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Assign Employee</label>
                  <select 
                    className="search-input w-full appearance-none"
                    value={orderForm.assignedEmployee}
                    onChange={e => setOrderForm({...orderForm, assignedEmployee: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {employeesList.map(emp => (
                      <option key={emp._id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-muted)' }}>Paid Amount (₹)</label>
                  <input 
                    type="number" min="0" required
                    className="search-input w-full"
                    value={orderForm.paidAmount}
                    onChange={e => setOrderForm({...orderForm, paidAmount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg flex justify-between items-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
                <span className="font-medium" style={{ color: 'var(--theme-text-muted)' }}>Total Amount:</span>
                <span className="text-xl font-bold" style={{ color: 'var(--color-yellow-500)' }}>₹{(orderForm.quantity * orderForm.price).toLocaleString()}</span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingOrder} className="btn-primary">
                  {savingOrder ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
