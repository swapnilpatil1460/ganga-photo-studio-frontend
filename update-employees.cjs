const fs = require('fs');
let content = fs.readFileSync('src/pages/EmployeesPage.tsx', 'utf8');

// The file is currently messed up because the first replace didn't work.
// I will just fetch the file directly from github or use git checkout to restore it,
// then apply the changes properly.
