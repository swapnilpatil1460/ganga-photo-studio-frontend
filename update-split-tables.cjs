const fs = require('fs');

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

const newTableBlock = `        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading records...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--theme-text-muted)' }}>
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p className="text-lg">No records found for {selectedMonth}.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 bg-transparent p-0 border-0 shadow-none">
              
              {/* Unpaid Section */}
              {(() => {
                const unpaid = filtered.filter(r => r.status !== 'Paid');
                const remainingTotal = unpaid.reduce((sum, r) => sum + (r.components?.netSalary || 0), 0);
                if (unpaid.length === 0) return null;
                
                return (
                  <div className="dashboard-card" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>Unpaid Salaries</h3>
                      <div className="px-4 py-2 rounded-lg bg-orange-100 text-orange-800 font-bold border border-orange-200">
                        Total Remaining: ₹{remainingTotal.toLocaleString()}
                      </div>
                    </div>
                    <div className="table-container shadow-none border-0 overflow-visible p-0" style={{ background: 'transparent' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Designation</th>
                            <th>Attendance</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unpaid.map(record => (
                            <tr key={record._id} className="hover:bg-gray-50/5 cursor-pointer transition-colors" onClick={() => navigate(\`/dashboard/salary/employee/\${record.employeeId._id}?month=\${selectedMonth}\`)}>
                              <td>
                                <div className="font-medium" style={{ color: 'var(--theme-text)' }}>{record.employeeId?.name || 'Unknown'}</div>
                                <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.email}</div>
                              </td>
                              <td style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.role}</td>
                              <td>
                                <div className="text-sm">P: {record.attendance?.present || 0} / {record.attendance?.workingDays || 0}</div>
                                <div className="text-xs text-red-500">A: {record.attendance?.absent || 0}</div>
                              </td>
                              <td className="font-medium">
                                ₹{(record.components?.netSalary || 0).toLocaleString()}
                              </td>
                              <td>{getStatusBadge(record)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Paid Section */}
              {(() => {
                const paid = filtered.filter(r => r.status === 'Paid');
                const paidTotal = paid.reduce((sum, r) => sum + (r.components?.netSalary || 0), 0);
                if (paid.length === 0) return null;
                
                return (
                  <div className="dashboard-card" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>Paid Salaries</h3>
                      <div className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-bold border border-green-200">
                        Total Paid: ₹{paidTotal.toLocaleString()}
                      </div>
                    </div>
                    <div className="table-container shadow-none border-0 overflow-visible p-0" style={{ background: 'transparent' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Designation</th>
                            <th>Attendance</th>
                            <th>Net Salary</th>
                            <th>Paid Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paid.map(record => (
                            <tr key={record._id} className="hover:bg-gray-50/5 cursor-pointer transition-colors" onClick={() => navigate(\`/dashboard/salary/employee/\${record.employeeId._id}?month=\${selectedMonth}\`)}>
                              <td>
                                <div className="font-medium" style={{ color: 'var(--theme-text)' }}>{record.employeeId?.name || 'Unknown'}</div>
                                <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.email}</div>
                              </td>
                              <td style={{ color: 'var(--theme-text-muted)' }}>{record.employeeId?.role}</td>
                              <td>
                                <div className="text-sm">P: {record.attendance?.present || 0} / {record.attendance?.workingDays || 0}</div>
                                <div className="text-xs text-red-500">A: {record.attendance?.absent || 0}</div>
                              </td>
                              <td className="font-medium">
                                ₹{(record.components?.netSalary || 0).toLocaleString()}
                              </td>
                              <td>
                                {record.paymentDetails?.paymentDate ? (
                                  <div className="text-sm" style={{ color: 'var(--theme-text)' }}>
                                    {new Date(record.paymentDetails.paymentDate).toLocaleDateString()}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>`;

const startIdx = c.indexOf('<div className="table-container">');
const endIdx = c.indexOf('      </div>\r\n    </div>\r\n  );\r\n}');
const endIdxLF = c.indexOf('      </div>\n    </div>\n  );\n}');

const targetEnd = endIdx > -1 ? endIdx : endIdxLF;

if (startIdx > -1 && targetEnd > -1) {
  c = c.substring(0, startIdx) + newTableBlock + c.substring(targetEnd);
  fs.writeFileSync('src/pages/SalaryPage.tsx', c);
  console.log('Tables split successfully');
} else {
  console.log('Could not find boundaries', startIdx, targetEnd);
}
