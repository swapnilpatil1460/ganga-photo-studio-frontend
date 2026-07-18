import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Activity, Briefcase, Calendar, Phone, Mail, User } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  dateJoined: string;
  photo?: string;
}

interface ActivityLog {
  _id: string;
  actionType: string;
  orderId: string;
  description: string;
  timestamp: string;
}

interface DashboardMetrics {
  assignedToday: number;
  completedToday: number;
  pendingOrders: number;
  averageCompletionTime: number;
}

export default function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [empRes, actRes, dashRes] = await Promise.all([
          fetch(`http://localhost:5000/api/employees/${id}`, { headers }),
          fetch(`http://localhost:5000/api/employees/${id}/activities`, { headers }),
          fetch(`http://localhost:5000/api/employees/${id}/dashboard`, { headers })
        ]);

        if (empRes.ok) setEmployee(await empRes.json());
        if (actRes.ok) setActivities(await actRes.json());
        if (dashRes.ok) setMetrics(await dashRes.json());
      } catch (err) {
        console.error('Error fetching employee details', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchAllData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading employee details...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-red-500">Employee not found.</div>;
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'Owner': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'Manager': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'Photographer': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Editor': return 'text-teal-600 bg-teal-100 border-teal-200';
      case 'Printer Operator': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Receptionist': return 'text-pink-600 bg-pink-100 border-pink-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full overflow-hidden p-6 space-y-6 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/employees')}
            className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-muted)' }}>
              {employee.photo ? (
                <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                employee.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{employee.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-semibold border rounded-md ${getRoleColor(employee.role)}`}>
                  {employee.role}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="rounded-xl p-5 shadow-sm border" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Assigned Today</h3>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={20} /></div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{metrics.assignedToday}</p>
          </div>
          
          <div className="rounded-xl p-5 shadow-sm border" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Completed Today</h3>
              <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20} /></div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{metrics.completedToday}</p>
          </div>
          
          <div className="rounded-xl p-5 shadow-sm border" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Pending Orders</h3>
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Activity size={20} /></div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{metrics.pendingOrders}</p>
          </div>
          
          <div className="rounded-xl p-5 shadow-sm border" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Avg Completion Time</h3>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Clock size={20} /></div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{metrics.averageCompletionTime} hrs</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl p-5 shadow-sm border" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-muted)' }}>
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>EMAIL</p>
                  <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-muted)' }}>
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>PHONE</p>
                  <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-muted)' }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>DATE JOINED</p>
                  <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{new Date(employee.dateJoined).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl p-5 shadow-sm border h-[500px] flex flex-col" style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)' }}>
            <h3 className="text-lg font-bold mb-4 shrink-0" style={{ color: 'var(--theme-text)' }}>Activity Timeline</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {activities.length === 0 ? (
                <div className="text-center mt-10" style={{ color: 'var(--theme-text-muted)' }}>
                  <Activity size={32} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
                  <p>No recent activities found.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {activities.map((act) => (
                    <div key={act._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-blue-100 text-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        {act.actionType === 'Status Update' ? <Activity size={14} /> : <Briefcase size={14} />}
                      </div>
                      
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{act.orderId}</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>{new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{act.description}</p>
                        <p className="text-xs opacity-75 mt-2" style={{ color: 'var(--theme-text-muted)' }}>{new Date(act.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
