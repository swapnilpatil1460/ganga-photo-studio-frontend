const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
  "const SalaryPage = lazy(() => import('./pages/SalaryPage'));",
  "const SalaryPage = lazy(() => import('./pages/SalaryPage'));\nconst EmployeeSalaryPage = lazy(() => import('./pages/EmployeeSalaryPage'));"
);

c = c.replace(
  '<Route path="salary" element={<SalaryPage />} />',
  '<Route path="salary" element={<SalaryPage />} />\n                <Route path="salary/employee/:id" element={<EmployeeSalaryPage />} />'
);

fs.writeFileSync('src/App.tsx', c);
console.log('App.tsx updated');
