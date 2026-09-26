const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldSidebar = `              <div className="px-6 py-2 mt-4 text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider opacity-70">HR & Payroll</div>
              <SidebarItem icon={<UserSquare2 size={20} />} label="Employees" path="/dashboard/employees" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem icon={<IndianRupee size={20} />} label="Salary Management" path="/dashboard/salary" onClick={() => setIsSidebarOpen(false)} />
              
              <div className="px-6 py-2 mt-4 text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider opacity-70">System</div>
              <SidebarItem icon={<Users size={20} />} label="System Access" path="/dashboard/users" onClick={() => setIsSidebarOpen(false)} />`;

const newSidebar = `              <SidebarItem icon={<UserSquare2 size={20} />} label="Employees" path="/dashboard/employees" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem icon={<Users size={20} />} label="System Users" path="/dashboard/users" onClick={() => setIsSidebarOpen(false)} />`;

// Handle possible \r\n differences
content = content.replace(/\r\n/g, '\n');

// Actually let's just use regex replacement because exact string matching can fail if spacing differs slightly.
content = content.replace(
  /<div className="px-6 py-2 mt-4 text-\[10px\] font-semibold text-\[var\(--theme-text-muted\)\] uppercase tracking-wider opacity-70">HR & Payroll<\/div>[\s\S]*?<SidebarItem icon={<Users size={20} \/>} label="System Access" path="\/dashboard\/users" onClick={\(\) => setIsSidebarOpen\(false\)} \/>/,
  newSidebar
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Dashboard sidebar updated');
