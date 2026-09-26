const fs = require('fs');

let content = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

// 1. Replace hardcoded grays with standard theme variables
content = content.replace(/text-gray-500/g, 'text-[var(--theme-text-muted)]');
content = content.replace(/text-gray-400/g, 'text-[var(--theme-text-muted)]');

// 2. Add Calendar State & Logic
// Add leaveMap state to attendance
const stateBlock = `  const [attendance, setAttendance] = useState({ workingDays: 26, present: 26, paidLeave: 0, unpaidLeave: 0, absent: 0 });`;
const newStateBlock = `  const [attendance, setAttendance] = useState<any>({ workingDays: 26, present: 26, paidLeave: 0, unpaidLeave: 0, absent: 0, leaveMap: {} });
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
  };`;

content = content.replace(stateBlock, newStateBlock);

// 3. Add Calendar UI to Attendance Summary
const attendanceSummaryHTML = `<div className="dashboard-card">
            <h3 className="text-md font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Attendance Summary</h3>`;

const calendarHTML = `
            <div className="mb-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={'empty-'+i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const status = attendance.leaveMap?.[day];
                  let bg = 'bg-gray-100 dark:bg-gray-800 text-[var(--theme-text)]';
                  if (status === 'A') bg = 'bg-red-500 text-white';
                  if (status === 'PL') bg = 'bg-green-500 text-white';
                  if (status === 'UL') bg = 'bg-orange-500 text-white';
                  return (
                    <button 
                      key={day} 
                      onClick={() => toggleLeave(day)}
                      disabled={isReadOnly}
                      className={\`h-8 rounded text-xs font-medium flex items-center justify-center transition-colors \${bg} hover:opacity-80\`}
                      title={status === 'A' ? 'Absent' : status === 'PL' ? 'Paid Leave' : status === 'UL' ? 'Unpaid Leave' : 'Present'}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-3 text-xs justify-center" style={{ color: 'var(--theme-text-muted)' }}>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Absent</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Paid Leave</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Unpaid</div>
              </div>
            </div>
`;

content = content.replace(attendanceSummaryHTML, attendanceSummaryHTML + calendarHTML);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', content);
console.log('EmployeeSalaryPage updated with calendar and darker text.');
