const fs = require('fs');

let content = fs.readFileSync('src/pages/EmployeesPage.tsx', 'utf8');

// The file should currently have:
/*
      <div className="page-header flex-col items-start gap-4">
        <h1 className="page-title">Employee Management</h1>
        <div className="flex gap-6 border-b border-gray-800/50 w-full pb-[-1px]">
          <button className="pb-2 border-b-2 font-medium flex items-center gap-2" style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}>
            <Users size={18} /> Employees
          </button>
          <button 
            onClick={() => navigate('/dashboard/salary')} 
            className="pb-2 border-b-2 border-transparent text-gray-500 hover:text-gray-300 font-medium transition-colors flex items-center gap-2"
          >
            <IndianRupee size={18} /> Salary Management
          </button>
        </div>
      </div>
*/
// Let's replace the rest (from table-controls down to Refresh)
content = content.replace(
  /<div className="table-controls[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="table-controls flex justify-end items-center mb-6 mt-4">
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
      </div>`
);

fs.writeFileSync('src/pages/EmployeesPage.tsx', content);
console.log("EmployeesPage updated successfully");
