const fs = require('fs');

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

c = c.replace(
  `  interface SalaryRecord {
    _id: string;
    employeeId: { _id: string; name: string; role: string; email: string };
    month: string;
    status: 'Draft' | 'Calculated' | 'Paid';
    components: { netSalary: number };
    attendance: { workingDays: number; present: number; absent: number };
  }`,
  `  interface SalaryRecord {
    _id: string;
    employeeId: { _id: string; name: string; role: string; email: string };
    month: string;
    status: 'Draft' | 'Calculated' | 'Paid';
    components: { netSalary: number };
    attendance: { workingDays: number; present: number; absent: number };
    paymentDetails?: { paymentDate: string; transactionReference: string };
  }`
);

c = c.replace(
  `  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">Paid</span>;
      case 'Calculated': return <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200">Calculated</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };`,
  `  const getStatusBadge = (record: SalaryRecord) => {
    switch (record.status) {
      case 'Paid': 
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">Paid</span>
            {record.paymentDetails?.paymentDate && (
              <span className="text-xs text-[var(--theme-text-muted)]">
                {new Date(record.paymentDetails.paymentDate).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      case 'Calculated': return <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200">Calculated</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };`
);

c = c.replace(
  `<td>{getStatusBadge(record.status)}</td>`,
  `<td>{getStatusBadge(record)}</td>`
);

fs.writeFileSync('src/pages/SalaryPage.tsx', c);
console.log('Done');
