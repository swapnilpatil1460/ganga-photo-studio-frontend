const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

const confirmPaymentFunc = `  const confirmPayment = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/salary/\${currentRecord._id}/pay\`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ transactionReference: transactionRef })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRecord(data);
        setShowPaymentModal(false);
        showNotification('Salary marked as Paid!');
      } else {
        showNotification('Failed to mark as paid', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error processing payment', 'error');
    }
  };`;

const newConfirmPaymentFunc = `  const confirmPayment = async () => {
    // Validation: Require transaction reference to be 6-25 alphanumeric characters
    const cleanRef = transactionRef.trim();
    const isValidRef = /^[a-zA-Z0-9-]{6,25}$/.test(cleanRef);
    
    if (!isValidRef) {
      showNotification('Please enter a valid 6-25 character Transaction No. (e.g., UTR, Cheque, or Phone No.)', 'error');
      return;
    }

    try {
      const res = await fetch(\`\${API_BASE}/salary/\${currentRecord._id}/pay\`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ transactionReference: cleanRef })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRecord(data);
        setShowPaymentModal(false);
        showNotification('Salary marked as Paid!');
      } else {
        showNotification('Failed to mark as paid', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error processing payment', 'error');
    }
  };`;

c = c.replace(confirmPaymentFunc, newConfirmPaymentFunc);

// Also remove "(Optional)" from the label
c = c.replace(
  `<label>Transaction Reference / Notes (Optional)</label>`,
  `<label>Transaction Reference No. <span className="text-red-500">*</span></label>`
);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Validation added');
