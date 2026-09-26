const fs = require('fs');
let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

c = c.replace(
`  const handleCalculate = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/salary/calculate\`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          employeeId: id,
          month: monthParam,
          attendance,
          components
        })
      });`,
`  const handleCalculate = async () => {
    let leaveDeduction = 0;
    if (attendance.workingDays > 0) {
      const perDaySalary = Number(components.basicSalary) / attendance.workingDays;
      const unpaidDays = Number(attendance.absent) + Number(attendance.unpaidLeave);
      leaveDeduction = Math.round(unpaidDays * perDaySalary);
    }
    
    try {
      const res = await fetch(\`\${API_BASE}/salary/calculate\`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          employeeId: id,
          month: monthParam,
          attendance,
          components: { ...components, leaveDeduction }
        })
      });`
);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Done');
