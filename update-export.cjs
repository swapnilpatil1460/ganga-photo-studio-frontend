const fs = require('fs');

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

const exportFunc = `  const handleExport = () => {
    // We can fetch the CSV directly or open it in a new tab if it doesn't require auth headers.
    // Since it requires authenticateToken and credentials: 'include', we should fetch it and trigger download.
    fetch(\`\${API_BASE}/salary/export/csv\`, {
      credentials: 'include',
      headers: authHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to export');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`employee_salary_history_\${new Date().toISOString().split('T')[0]}.csv\`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => {
      console.error(err);
      alert('Error exporting data');
    });
  };`;

// Insert after fetchRecords
c = c.replace(
  `  const fetchRecords = async () => {`,
  exportFunc + `\n\n  const fetchRecords = async () => {`
);

// Replace button onClick
c = c.replace(
  `<button className="btn-outline flex items-center gap-2" onClick={fetchRecords}>
            <Download size={18} /> Export
          </button>`,
  `<button className="btn-outline flex items-center gap-2" onClick={handleExport}>
            <Download size={18} /> Export
          </button>`
);

fs.writeFileSync('src/pages/SalaryPage.tsx', c);
console.log('Frontend export updated');
