const fs = require('fs');

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

c = c.replace(
  `interface SalaryRecord {
    _id: string;
    employeeId: { _id: string; name: string; role: string; email: string };
    month: string;
    status: 'Draft' | 'Calculated' | 'Paid';
    components: { netSalary: number };
    attendance: { workingDays: number; present: number; absent: number };
  }`,
  `interface SalaryRecord {
    _id: string;
    employeeId: { _id: string; name: string; role: string; email: string };
    month: string;
    status: 'Draft' | 'Calculated' | 'Paid';
    components: { netSalary: number };
    attendance: { workingDays: number; present: number; absent: number };
    paymentDetails?: { paymentDate: string; transactionReference: string };
  }`
);

fs.writeFileSync('src/pages/SalaryPage.tsx', c);
console.log('Done');
