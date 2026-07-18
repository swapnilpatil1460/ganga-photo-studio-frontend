import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Loader, AlertCircle, Edit, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';

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

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="badge badge-green">ACTIVE</span>;
      case 'On Leave': return <span className="badge badge-gold">ON LEAVE</span>;
      case 'Former': return <span className="badge badge-gray">FORMER</span>;
      default: return <span className="badge badge-gray">{status.toUpperCase()}</span>;
    }
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Employee List</h1>
        <button 
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add Employee
        </button>
      </div>

      <div className="table-controls flex-col md:flex-row flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1 w-full md:w-auto">
          <div className="search-wrapper flex-1 max-w-md">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <button className="btn-outline flex items-center gap-2 mt-4 md:mt-0" onClick={() => { setSearch(''); fetchEmployees(); }}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle size={32} className="mb-2 text-gray-400" />
            <p className="text-lg">No employees found.</p>
            <p className="text-sm mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr 
                  key={emp._id} 
                  onClick={() => navigate(`/dashboard/employees/${emp._id}`)}
                  className="cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-muted)' }}>
                        {emp.photo ? (
                          <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'var(--theme-text)' }}>{emp.name}</div>
                        <div className="text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>ID: {emp._id.substring(0,6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getRoleColor(emp.role)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm" style={{ color: 'var(--theme-text)' }}>{emp.phone}</div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{emp.email}</div>
                  </td>
                  <td>
                    {getStatusBadge(emp.status)}
                  </td>
                  <td className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {new Date(emp.dateJoined).toLocaleDateString()}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button 
                        className="action-btn view" 
                        title="View Profile" 
                        onClick={() => navigate(`/dashboard/employees/${emp._id}`)}
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        className="action-btn edit" 
                        title="Edit" 
                        onClick={() => handleEdit(emp)}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <EmployeeForm 
          employee={selectedEmployee} 
          onClose={() => setShowForm(false)} 
          onSave={fetchEmployees}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
