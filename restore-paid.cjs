const fs = require('fs');

const paidSection = `              {/* Paid Section */}
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
`;

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

c = c.replace(
  `              })()}
            </div>
          )}
        </div>
      </div>
  );
}`,
  `              })()}
${paidSection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/pages/SalaryPage.tsx', c);
console.log('Restored paid section');
