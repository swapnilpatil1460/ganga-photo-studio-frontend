import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, Calendar, Clock, FileText, Activity, Shield, Download, MapPin, Phone, Mail, Camera, Loader, CheckCircle2, XCircle, FileEdit, History, AlertCircle } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Action state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const [orderRes, empRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/employees?limit=100&t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' } })
      ]);
      
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrder(data);
        setSelectedStatus(data.status);
        setSelectedEmployee(data.assignedEmployee || '');
      }
      if (empRes.ok) {
        const result = await empRes.json();
        setEmployeesList(result.data || result);
      }
    } catch (err) {
      console.error('Error fetching order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: selectedStatus, changedBy: 'Admin User' }) // Mock user
      });
      fetchOrder();
    } catch (err) {
      console.error('Error updating status', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployee || selectedEmployee === order.assignedEmployee) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ employee: selectedEmployee, changedBy: 'Admin User' })
      });
      fetchOrder();
    } catch (err) {
      console.error('Error assigning employee', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(paymentAmount), changedBy: 'Owner' })
      });
      setPaymentAmount('');
      setShowPaymentInput(false);
      fetchOrder();
    } catch (err) {
      console.error('Error updating payment', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader className="animate-spin text-yellow-500" size={32} />
    </div>
  );

  if (!order) return (
    <div className="flex h-full items-center justify-center text-gray-500">
      Order not found.
    </div>
  );

  const getCustomerName = (c: any) => typeof c === 'string' ? 'Walk-in Customer' : c?.name;
  const getCustomerPhone = (c: any) => typeof c === 'string' ? 'N/A' : c?.phone;

  // Timeline phases
  const phases = ['Received', 'Assigned', 'Editing', 'Printing', 'Ready', 'Delivered'];
  const currentPhaseIndex = phases.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="animate-fade-in max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pr-2 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard/orders')}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:border-yellow-500 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order <span className="text-yellow-500 font-mono">{order.orderId}</span>
            {isCancelled && <span className="bg-red-500/20 text-red-400 text-sm px-3 py-1 rounded-full border border-red-500/30">Cancelled</span>}
          </h2>
          <p className="text-gray-600">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Info Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <User size={18} className="text-blue-400" /> Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">NAME</p>
                  <p className="text-sm text-gray-900">{getCustomerName(order.customer)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">PHONE</p>
                  <p className="text-sm text-gray-900">{getCustomerPhone(order.customer)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Camera size={18} className="text-purple-400" /> Service Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">SERVICE</p>
                  <p className="text-sm text-gray-900">{order.service}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">QUANTITY</p>
                    <p className="text-sm text-gray-900">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">AMOUNT</p>
                    <p className="text-sm text-yellow-500 font-bold">₹{(order.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Calendar size={18} className="text-yellow-400" /> Delivery Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">EXPECTED DELIVERY</p>
                  <p className="text-sm text-gray-900">{new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">PRIORITY</p>
                  <p className={`text-sm font-bold ${
                    order.priority === 'Urgent' ? 'text-red-400' :
                    order.priority === 'High' ? 'text-orange-400' :
                    order.priority === 'Normal' ? 'text-green-400' : 'text-gray-600'
                  }`}>{order.priority || 'Normal'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2"><FileText size={18} className="text-green-400" /> Financials</div>
                <button onClick={() => navigate(`/dashboard/invoices/${order._id}`)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">View Invoice</button>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Total Amount</span>
                  <span className="font-bold text-gray-900">₹{(order.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Amount Paid</span>
                  <span className="font-bold text-green-500">₹{(order.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-900 font-bold">Remaining Due</span>
                  <span className="font-bold text-red-500">₹{((order.totalAmount || 0) - (order.paidAmount || 0)).toLocaleString()}</span>
                </div>
                
                {((order.totalAmount || 0) - (order.paidAmount || 0)) > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    {!showPaymentInput ? (
                      <button 
                        onClick={() => setShowPaymentInput(true)}
                        className="w-full py-2 bg-green-50 text-green-600 font-medium rounded-lg text-sm border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        + Add Payment
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 animate-fade-in">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleUpdatePayment} disabled={actionLoading} className="flex-1 py-1.5 bg-green-500 text-white font-medium rounded-lg text-sm hover:bg-green-600 transition-colors">
                            Save
                          </button>
                          <button onClick={() => setShowPaymentInput(false)} className="flex-1 py-1.5 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-8">
              <Clock size={18} className="text-yellow-500" /> Workflow Timeline
            </h3>
            
            <div className="relative flex justify-between">
              {/* Connecting Line */}
              <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-50 -z-10"></div>
              {/* Active Connecting Line */}
              {!isCancelled && currentPhaseIndex > 0 && (
                <div 
                  className="absolute top-4 left-0 h-0.5 bg-yellow-500 -z-10 transition-all duration-500"
                  style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }}
                ></div>
              )}

              {phases.map((phase, idx) => {
                let status = 'pending';
                if (isCancelled) {
                  status = order.timeline.find((t: any) => t.status === phase) ? 'completed' : 'pending';
                } else {
                  if (idx < currentPhaseIndex) status = 'completed';
                  else if (idx === currentPhaseIndex) status = 'active';
                }

                // Find timestamp for this phase
                const log = order.timeline.find((t: any) => t.status === phase);
                
                return (
                  <div key={phase} className="flex flex-col items-center gap-2 relative bg-white px-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      status === 'completed' ? 'bg-yellow-500 border-yellow-500 text-black' :
                      status === 'active' ? 'bg-white border-yellow-500 text-yellow-500 animate-pulse' :
                      'bg-white border-gray-300 text-gray-600'
                    }`}>
                      {status === 'completed' ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${status !== 'pending' ? 'text-gray-900' : 'text-gray-500'}`}>{phase}</p>
                      {log && <p className="text-[10px] text-gray-500 mt-1">{new Date(log.timestamp).toLocaleDateString()}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {isCancelled && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                <XCircle size={20} />
                <span className="font-medium">This order was cancelled. Workflow is halted.</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Actions & Logs */}
        <div className="space-y-6">
          
          {/* Admin Action Panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FileEdit size={18} className="text-blue-400" /> Admin Controls
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Update Status</label>
                <div className="flex gap-2">
                  <select 
                    className="search-input appearance-none flex-1 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isCancelled || order.status === 'Delivered'}
                  >
                    {phases.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={handleUpdateStatus}
                    disabled={actionLoading || isCancelled || order.status === 'Delivered'}
                    className="px-4 bg-yellow-500 text-black font-semibold text-sm rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assign Employee</label>
                <div className="flex gap-2">
                  <select 
                    className="search-input appearance-none flex-1 text-sm"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {employeesList.map(emp => (
                      <option key={emp._id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAssignEmployee}
                    disabled={actionLoading}
                    className="px-4 bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col max-h-[500px]">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <History size={18} className="text-gray-600" /> Activity Logs
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {order.activityLogs && order.activityLogs.length > 0 ? (
                order.activityLogs.sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()).map((log: any, idx: number) => (
                  <div key={idx} className="relative pl-6 border-l border-gray-200 pb-4 last:pb-0">
                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-charcoal-600"></div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(log.changedAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 font-medium">{log.changedBy}</p>
                    
                    {log.notes ? (
                      <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        Changed status from <span className="text-gray-500 font-semibold">{log.previousStatus}</span> to <span className="text-yellow-500 font-semibold">{log.newStatus}</span>
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity logs recorded.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
