const fs = require('fs');

let content = fs.readFileSync('src/pages/EmployeesPage.tsx', 'utf8');

// Normalize line endings for reliable string replacement
content = content.replace(/\r\n/g, '\n');

const oldHeader = `<div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <button 
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add Employee
        </button>
      </div>`;

const newHeader = `<div className="page-header flex-col items-start gap-4">
        <div className="w-full">
          <h1 className="page-title mb-6">Employee Management</h1>
          <div className="flex gap-8 border-b border-gray-800/50 w-full">
            <button className="pb-3 border-b-2 font-medium flex items-center gap-2" style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}>
              <Users size={18} /> Employees
            </button>
            <button 
              onClick={() => navigate('/dashboard/salary')} 
              className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-300 font-medium transition-colors flex items-center gap-2"
            >
              <IndianRupee size={18} /> Salary Management
            </button>
          </div>
        </div>
      </div>`;

content = content.replace(oldHeader, newHeader);

const oldControls = `<div className="table-controls flex-col md:flex-row flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1 w-full md:w-auto">
          <button 
            onClick={() => navigate('/dashboard/salary')} 
            className="btn-outline flex items-center gap-2"
            style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
          >
            <IndianRupee size={18} />
            Salary Management
          </button>
        </div>
        
        <button className="btn-outline flex items-center gap-2 mt-4 md:mt-0" onClick={() => { setSearch(''); fetchEmployees(); }}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>`;

const newControls = `<div className="table-controls flex justify-end items-center mb-6 mt-4">
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2" onClick={() => { setSearch(''); fetchEmployees(); }}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button 
            onClick={handleAdd}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={20} />
            Add Employee
          </button>
        </div>
      </div>`;

content = content.replace(oldControls, newControls);

fs.writeFileSync('src/pages/EmployeesPage.tsx', content);
console.log("EmployeesPage updated cleanly");
