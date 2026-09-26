const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

c = c.replace(
  `const [attendance, setAttendance] = useState({`,
  `const [attendance, setAttendance] = useState<any>({`
);

c = c.replace(
  `const [components, setComponents] = useState({`,
  `const [components, setComponents] = useState<any>({`
);

c = c.replace(/Number\(e\.target\.value\)/g, `e.target.value === '' ? '' : Number(e.target.value)`);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Inputs fixed');
