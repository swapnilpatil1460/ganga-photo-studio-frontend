const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

c = c.replace(
  `const isValidRef = /^[a-zA-Z0-9-]{6,25}$/.test(cleanRef);`,
  `const isValidRef = /^[a-zA-Z0-9- ]{6,25}$/.test(cleanRef);`
);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Regex updated');
