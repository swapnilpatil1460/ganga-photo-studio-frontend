const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

c = c.replace(
  `setComponents(prev => ({`,
  `setComponents((prev: any) => ({`
);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Fixed prev any type');
