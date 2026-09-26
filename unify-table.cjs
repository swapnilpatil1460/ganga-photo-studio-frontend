const fs = require('fs');

const c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

const startIdx = c.indexOf('<div className="table-container">');
const endFile = c.indexOf('// Simple dummy icon');
if (startIdx === -1 || endFile === -1) {
  console.log('Could not find split points');
  process.exit(1);
}

const newTableBlock = `<div className="table-container">
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
                  <th>Paid Salary</th>
                  <th>Unpaid Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => {
                  const net = record.components?.netSalary || 0;
                  const isPaid = record.status === 'Paid';
                  const paidAmount = isPaid ? net : 0;
                  const unpaidAmount = !isPaid ? net : 0;

                  return (
                    <tr key={record._id} className="hover:bg-gray-50/5 cursor-pointer" onClick={() => navigate(\`/dashboard/salary/employee/\${record.employeeId._id}?month=\${selectedMonth}\`)}>
                      <td>
                        <div className="font-medium" style={{ color: 'var(--theme-text)' }}>{record.employeeId?.name || 'Unknown'}</div>
                        <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.email}</div>
                      </td>
                      <td style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.role}</td>
                      <td>
                        <div className="text-sm">P: {record.attendance?.present || 0} / {record.attendance?.workingDays || 0}</div>
                        <div className="text-xs text-red-500">A: {record.attendance?.absent || 0}</div>
                      </td>
                      <td className="font-medium text-gray-400">
                        ₹{net.toLocaleString()}
                      </td>
                      <td className="font-medium text-green-500">
                        ₹{paidAmount.toLocaleString()}
                      </td>
                      <td className="font-medium text-orange-400">
                        ₹{unpaidAmount.toLocaleString()}
                      </td>
                      <td>{getStatusBadge(record)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

`;

const newFileContent = c.substring(0, startIdx) + newTableBlock + c.substring(endFile);

fs.writeFileSync('src/pages/SalaryPage.tsx', newFileContent);
console.log('Unified table created');
