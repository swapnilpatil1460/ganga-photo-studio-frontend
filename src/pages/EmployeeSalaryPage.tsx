import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, IndianRupee, Clock, CheckCircle, AlertCircle, Save, Calendar } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '') + '/api';
const authHeaders = () => ({ 'Content-Type': 'application/json' });

export default function EmployeeSalaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthParam = searchParams.get('month') || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const [employee, setEmployee] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  
  // Edit states for draft
  const [attendance, setAttendance] = useState<any>({ workingDays: 26, present: 26, paidLeave: 0, unpaidLeave: 0, absent: 0, leaveMap: {} });
  const [year, month] = monthParam.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  const toggleLeave = (day: number) => {
    if (isReadOnly) return;
    const current = attendance.leaveMap?.[day];
    let next = '';
    if (!current) next = 'A'; // Absent
    else if (current === 'A') next = 'PL'; // Paid Leave
    else if (current === 'PL') next = 'UL'; // Unpaid Leave
    else next = ''; // Clear
    
    const newLeaveMap = { ...(attendance.leaveMap || {}), [day]: next };
    if (!next) delete newLeaveMap[day];
    
    // Auto calculate totals
    let abs = 0, pl = 0, ul = 0;
    Object.values(newLeaveMap).forEach(v => {
      if (v === 'A') abs++;
      if (v === 'PL') pl++;
      if (v === 'UL') ul++;
    });
    
    setAttendance({
      ...attendance,
      leaveMap: newLeaveMap,
      absent: abs,
      paidLeave: pl,
      unpaidLeave: ul,
      present: attendance.workingDays - abs - pl - ul
    });
  };
  const [components, setComponents] = useState({ 
    basicSalary: 0, allowances: 0, overtime: 0, incentive: 0, 
    otherEarnings: 0, deductions: 0, advanceRecovery: 0 
  });
  
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const empRes = await fetch(`${API_BASE}/employees/${id}`, { credentials: 'include', headers: authHeaders() });
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployee(empData);
          setComponents(prev => ({
            ...prev,
            basicSalary: empData.salaryStructure?.basicSalary || 0,
            allowances: empData.salaryStructure?.allowances || 0
          }));
        }

        const histRes = await fetch(`${API_BASE}/salary/employee/${id}`, { credentials: 'include', headers: authHeaders() });
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData);
          
          const current = histData.find((r: any) => r.month === monthParam);
          if (current) {
            setCurrentRecord(current);
            setAttendance(current.attendance);
            setComponents(current.components);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id, monthParam]);

  const handleCalculate = async () => {
    let leaveDeduction = 0;
    if (attendance.workingDays > 0) {
      const perDaySalary = Number(components.basicSalary) / attendance.workingDays;
      const unpaidDays = Number(attendance.absent) + Number(attendance.unpaidLeave);
      leaveDeduction = Math.round(unpaidDays * perDaySalary);
    }
    
    try {
      const res = await fetch(`${API_BASE}/salary/calculate`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          employeeId: id,
          month: monthParam,
          attendance,
          components: { ...components, leaveDeduction }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRecord(data);
        showNotification('Salary calculated successfully!');
      } else {
        showNotification('Failed to calculate salary', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error calculating salary', 'error');
    }
  };

  const openPaymentModal = () => {
    if (!currentRecord || currentRecord.status !== 'Calculated') {
      showNotification('Must calculate salary first before paying.', 'error');
      return;
    }
    setTransactionRef('');
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    try {
      const res = await fetch(`${API_BASE}/salary/${currentRecord._id}/pay`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ transactionReference: transactionRef })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRecord(data);
        setShowPaymentModal(false);
      } else {
        showNotification('Failed to mark as paid', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error processing payment', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--theme-text-muted)]">Loading...</div>;
  if (!employee) return <div className="p-8 text-center text-[var(--theme-text-muted)]">Employee not found.</div>;

  const isReadOnly = currentRecord?.status === 'Paid';
  const gross = Number(components.basicSalary) + Number(components.otherEarnings);
  
  // Calculate Leave Deductions automatically based on attendance
  let leaveDeduction = 0;
  if (attendance.workingDays > 0) {
    const perDaySalary = Number(components.basicSalary) / attendance.workingDays;
    const unpaidDays = Number(attendance.absent) + Number(attendance.unpaidLeave);
    leaveDeduction = Math.round(unpaidDays * perDaySalary);
  }

  const totalDeductions = Number(components.deductions) + Number(components.advanceRecovery) + leaveDeduction;
  const net = gross - totalDeductions;

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard/salary')} className="text-sm flex items-center gap-2 mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        <ArrowLeft size={16} /> Back to Salary List
      </button>

      {/* Header Info */}
      <div className="dashboard-card mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl" style={{ color: 'var(--theme-accent)' }}>
            {employee.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{employee.name}</h1>
            <p style={{ color: 'var(--theme-text-muted)' }}>{employee.role} &bull; {employee.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Current Month Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                <Calendar size={20} style={{ color: 'var(--theme-accent)' }} /> 
                Salary for {monthParam}
              </h2>
              {currentRecord?.status === 'Paid' && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Paid</span>
              )}
              {currentRecord?.status === 'Calculated' && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">Calculated</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-800/50">
              <div className="col-span-2"><h3 className="text-sm font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Earnings</h3></div>
              <div className="form-group">
                <label>Basic Salary (₹)</label>
                <input type="number" value={components.basicSalary} onChange={e => setComponents({...components, basicSalary: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
              <div className="form-group">
                <label>Other Earnings (₹)</label>
                <input type="number" value={components.otherEarnings} onChange={e => setComponents({...components, otherEarnings: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-800/50">
              <div className="col-span-2"><h3 className="text-sm font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Deductions</h3></div>
              <div className="form-group">
                <label>Other Deductions (₹)</label>
                <input type="number" value={components.deductions} onChange={e => setComponents({...components, deductions: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
              <div className="form-group">
                <label>Advance Recovery (₹)</label>
                <input type="number" value={components.advanceRecovery} onChange={e => setComponents({...components, advanceRecovery: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-800/30 p-4 rounded-lg mb-6">
              <div>
                <div className="text-sm text-[var(--theme-text-muted)]">Gross: ₹{gross.toLocaleString()}</div>
                <div className="text-sm text-red-500/80">Leave Deduction: -₹{leaveDeduction.toLocaleString()}</div>
                <div className="text-sm text-[var(--theme-text-muted)]">Other Deductions: ₹{(Number(components.deductions) + Number(components.advanceRecovery)).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Net Salary</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--theme-accent)' }}>₹{net.toLocaleString()}</div>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex gap-4">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleCalculate}>
                  <Save size={18} /> Calculate & Save
                </button>
                <button 
                  className="btn-primary flex-1 flex items-center justify-center gap-2" 
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                  onClick={openPaymentModal}
                  disabled={currentRecord?.status !== 'Calculated'}
                >
                  <CheckCircle size={18} /> Mark as Paid
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Attendance & History */}
        <div className="space-y-6">
          <div className="dashboard-card">
            <h3 className="text-md font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Attendance Summary</h3>
            <div className="mb-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={'empty-'+i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const status = attendance.leaveMap?.[day];
                  let bg = 'bg-gray-200 text-gray-800'; // Default light gray with dark text
                  let border = 'border border-gray-300';
                  
                  if (status === 'A') { bg = 'bg-red-500 text-white'; border = 'border-red-600'; }
                  if (status === 'PL') { bg = 'bg-green-500 text-white'; border = 'border-green-600'; }
                  if (status === 'UL') { bg = 'bg-orange-500 text-white'; border = 'border-orange-600'; }
                  
                  // For dark theme compatibility if we want to rely on variables:
                  // Actually, hardcoding gray-200 is perfectly readable in both themes for a small calendar grid, 
                  // but we can use inline styles to be perfectly safe against global css.
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => toggleLeave(day)}
                      className={`h-8 rounded text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${bg} ${border} hover:opacity-80`}
                      title={status === 'A' ? 'Absent' : status === 'PL' ? 'Paid Leave' : status === 'UL' ? 'Unpaid Leave' : 'Present'}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-3 text-xs justify-center" style={{ color: 'var(--theme-text-muted)' }}>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Absent</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Paid Leave</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Unpaid</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--theme-text-muted)]">Working Days</span>
                <input type="number" className="form-input w-20 text-right p-1 h-8" value={attendance.workingDays} onChange={e => setAttendance({...attendance, workingDays: Number(e.target.value)})} disabled={isReadOnly}/>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--theme-text-muted)]">Present</span>
                <input type="number" className="form-input w-20 text-right p-1 h-8" value={attendance.present} onChange={e => setAttendance({...attendance, present: Number(e.target.value)})} disabled={isReadOnly}/>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--theme-text-muted)] text-red-400">Absent</span>
                <input type="number" className="form-input w-20 text-right p-1 h-8" value={attendance.absent} onChange={e => setAttendance({...attendance, absent: Number(e.target.value)})} disabled={isReadOnly}/>
              </div>
            </div>
            {!isReadOnly && (!currentRecord || currentRecord.status === 'Draft') && (
              <div className="mt-6 p-3 bg-amber-900/20 border border-amber-900/50 rounded-md flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-200">Attendance must be reviewed and salary calculated before payment.</p>
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h3 className="text-md font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Salary History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-[var(--theme-text-muted)]">No past records found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((record, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-gray-800/50 hover:bg-gray-800/30 cursor-pointer" onClick={() => navigate(`/dashboard/salary/employee/${id}?month=${record.month}`)}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{record.month}</div>
                      <div className="text-xs text-[var(--theme-text-muted)]">{record.status}</div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--theme-accent)' }}>
                      ₹{(record.components?.netSalary || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay flex items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-md relative animate-slide-up">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-white" onClick={() => setShowPaymentModal(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Mark Salary as Paid</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--theme-text-muted)' }}>
              Are you sure you want to mark this month's salary as Paid? This action will lock the salary record and it cannot be edited afterwards.
            </p>
            <div className="form-group mb-6">
              <label>Transaction Reference / Notes (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. UTR Number, Cash, Cheque No." 
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button className="btn-outline px-6 py-2" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn-primary px-6 py-2 flex items-center gap-2" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={confirmPayment}>
                <CheckCircle size={18} /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 animate-slide-up z-50">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
