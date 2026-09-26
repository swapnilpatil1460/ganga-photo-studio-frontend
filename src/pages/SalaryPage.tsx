import React, { useState, useEffect } from 'react';
import { Search, IndianRupee, Loader, AlertCircle, ChevronDown, CalendarDays, ExternalLink, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '') + '/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
});

interface SalaryRecord {
  _id: string;
  employeeId: { _id: string; name: string; role: string; email: string };
  month: string;
  status: 'Draft' | 'Calculated' | 'Paid';
  components: { netSalary: number };
  attendance: { workingDays: number; present: number; absent: number };
}

export default function SalaryPage() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const navigate = useNavigate();

  const handleExport = () => {
    // We can fetch the CSV directly or open it in a new tab if it doesn't require auth headers.
    // Since it requires authenticateToken and credentials: 'include', we should fetch it and trigger download.
    fetch(`${API_BASE}/salary/export/csv`, {
      credentials: 'include',
      headers: authHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to export');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employee_salary_history_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => {
      console.error(err);
      alert('Error exporting data');
    });
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/salary?month=${selectedMonth}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth]);

  const filtered = records.filter(r => 
    r.employeeId?.name.toLowerCase().includes(search.toLowerCase()) ||
    r.employeeId?.role.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">Paid</span>;
      case 'Calculated': return <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200">Calculated</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex-col items-start gap-4">
        <div className="w-full">
          <h1 className="page-title mb-6">HR & Payroll</h1>
          <div className="flex gap-8 border-b border-gray-800/50 w-full">
            <button 
              onClick={() => navigate('/dashboard/employees')}
              className="pb-3 border-b-2 border-transparent font-medium transition-colors flex items-center gap-2"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <Users size={18} /> Employees
            </button>
            <button className="pb-3 border-b-2 font-medium flex items-center gap-2" style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}>
              <IndianRupee size={18} /> Salary Management
            </button>
          </div>
        </div>
      </div>

      <div className="table-controls flex-col md:flex-row flex justify-between items-center mb-6 mt-4 gap-4">
        <div className="flex gap-4 flex-1 w-full md:w-auto items-center">
          <div className="relative">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="search-input cursor-pointer"
              style={{ width: '180px' }}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2" onClick={handleExport}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--theme-text-muted)' }}>
            <AlertCircle size={32} className="mb-2 opacity-50" />
            <p className="text-lg">No records found for {selectedMonth}.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Attendance</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => (
                <tr key={record._id} className="hover:bg-gray-50/5 cursor-pointer" onClick={() => navigate(`/dashboard/salary/employee/${record.employeeId._id}?month=${selectedMonth}`)}>
                  <td>
                    <div className="font-medium" style={{ color: 'var(--theme-text)' }}>{record.employeeId?.name || 'Unknown'}</div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.email}</div>
                  </td>
                  <td style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.role}</td>
                  <td>
                    <div className="text-sm">P: {record.attendance.present} / {record.attendance.workingDays}</div>
                    <div className="text-xs text-red-500">A: {record.attendance.absent}</div>
                  </td>
                  <td className="font-medium">
                    ₹{record.components.netSalary.toLocaleString()}
                  </td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td className="text-right">
                    <button className="icon-btn text-[var(--theme-accent)]">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Simple dummy icon to avoid another import issue if Users is missing
const Users = ({size}: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
