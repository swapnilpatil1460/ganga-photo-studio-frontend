const fs = require('fs');
let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

// 1. Compute leave deduction and update net/gross
const oldCalc = `  const isReadOnly = currentRecord?.status === 'Paid';
  const gross = Number(components.basicSalary) + Number(components.allowances) + Number(components.overtime) + Number(components.incentive) + Number(components.otherEarnings);
  const totalDeductions = Number(components.deductions) + Number(components.advanceRecovery);
  const net = gross - totalDeductions;`;

const newCalc = `  const isReadOnly = currentRecord?.status === 'Paid';
  const gross = Number(components.basicSalary) + Number(components.otherEarnings);
  
  // Calculate Leave Deductions automatically based on attendance
  let leaveDeduction = 0;
  if (attendance.workingDays > 0) {
    const perDaySalary = Number(components.basicSalary) / attendance.workingDays;
    const unpaidDays = Number(attendance.absent) + Number(attendance.unpaidLeave);
    leaveDeduction = Math.round(unpaidDays * perDaySalary);
  }

  const totalDeductions = Number(components.deductions) + Number(components.advanceRecovery) + leaveDeduction;
  const net = gross - totalDeductions;`;

c = c.replace(oldCalc, newCalc);

// 2. Remove Allowances, Overtime, Incentives UI
const oldEarningsUI = `<div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-800/50">
              <div className="col-span-2"><h3 className="text-sm font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Earnings</h3></div>
              <div className="form-group">
                <label>Basic Salary (₹)</label>
                <input type="number" value={components.basicSalary} onChange={e => setComponents({...components, basicSalary: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
              <div className="form-group">
                <label>Allowances (₹)</label>
                <input type="number" value={components.allowances} onChange={e => setComponents({...components, allowances: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
              <div className="form-group">
                <label>Overtime (₹)</label>
                <input type="number" value={components.overtime} onChange={e => setComponents({...components, overtime: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
              <div className="form-group">
                <label>Incentives (₹)</label>
                <input type="number" value={components.incentive} onChange={e => setComponents({...components, incentive: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
            </div>`;

const newEarningsUI = `<div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-800/50">
              <div className="col-span-2"><h3 className="text-sm font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Earnings</h3></div>
              <div className="form-group">
                <label>Basic Salary (₹)</label>
                <input type="number" value={components.basicSalary} onChange={e => setComponents({...components, basicSalary: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
              <div className="form-group">
                <label>Other Earnings (₹)</label>
                <input type="number" value={components.otherEarnings} onChange={e => setComponents({...components, otherEarnings: Number(e.target.value)})} disabled={isReadOnly} className="form-input" />
              </div>
            </div>`;

c = c.replace(oldEarningsUI, newEarningsUI);

// 3. Add Leave Deduction info to Deductions Summary block
const oldSummary = `              <div>
                <div className="text-sm text-[var(--theme-text-muted)]">Gross: ₹{gross.toLocaleString()}</div>
                <div className="text-sm text-[var(--theme-text-muted)]">Deductions: ₹{totalDeductions.toLocaleString()}</div>
              </div>`;

const newSummary = `              <div>
                <div className="text-sm text-[var(--theme-text-muted)]">Gross: ₹{gross.toLocaleString()}</div>
                <div className="text-sm text-red-500/80">Leave Deduction: -₹{leaveDeduction.toLocaleString()}</div>
                <div className="text-sm text-[var(--theme-text-muted)]">Other Deductions: ₹{(Number(components.deductions) + Number(components.advanceRecovery)).toLocaleString()}</div>
              </div>`;

c = c.replace(oldSummary, newSummary);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Done');
