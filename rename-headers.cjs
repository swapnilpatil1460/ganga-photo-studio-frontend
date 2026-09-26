const fs = require('fs');

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

const firstIdx = c.indexOf('<th>Net Salary</th>');
if (firstIdx !== -1) {
  c = c.substring(0, firstIdx) + '<th>Unpaid Salary</th>' + c.substring(firstIdx + 19);
}

const secondIdx = c.indexOf('<th>Net Salary</th>');
if (secondIdx !== -1) {
  c = c.substring(0, secondIdx) + '<th>Paid Salary</th>' + c.substring(secondIdx + 19);
}

fs.writeFileSync('src/pages/SalaryPage.tsx', c);
console.log('Headers renamed');
