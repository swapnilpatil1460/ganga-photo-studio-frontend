const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

// Add states for modal
c = c.replace(
  `  const [loading, setLoading] = useState(true);`,
  `  const [loading, setLoading] = useState(true);\n  const [showPaymentModal, setShowPaymentModal] = useState(false);\n  const [transactionRef, setTransactionRef] = useState('');`
);

// Update handlePay -> openPaymentModal and confirmPayment
c = c.replace(
  `  const handlePay = async () => {
    if (!currentRecord || currentRecord.status !== 'Calculated') {
      alert('Must calculate salary first before paying.');
      return;
    }
    const ref = prompt('Enter Transaction Reference (optional):');
    if (ref === null) return; // cancelled
    
    try {
      const res = await fetch(\`\${API_BASE}/salary/\${currentRecord._id}/pay\`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ transactionReference: ref })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRecord(data);
        alert('Salary marked as Paid!');
      }
    } catch (err) {
      console.error(err);
      alert('Error processing payment');
    }
  };`,
  `  const openPaymentModal = () => {
    if (!currentRecord || currentRecord.status !== 'Calculated') {
      alert('Must calculate salary first before paying.');
      return;
    }
    setTransactionRef('');
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
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
      } else {
        alert('Failed to mark as paid');
      }
    } catch (err) {
      console.error(err);
      alert('Error processing payment');
    }
  };`
);

// Update button onClick
c = c.replace(`onClick={handlePay}`, `onClick={openPaymentModal}`);

// Add modal JSX at the end of the return statement
const modalJSX = `
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay flex items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-md relative animate-slide-up">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-white" onClick={() => setShowPaymentModal(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Mark Salary as Paid</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--theme-text-muted)' }}>
              Are you sure you want to mark this month's salary as Paid? This action will lock the salary record and it cannot be edited afterwards.
            </p>
            <div className="form-group mb-6">
              <label>Transaction Reference / Notes (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. UTR Number, Cash, Cheque No." 
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button className="btn-outline px-6 py-2" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn-primary px-6 py-2 flex items-center gap-2" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={confirmPayment}>
                <CheckCircle size={18} /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

c = c.replace(`    </div>\r\n  );\r\n}`, modalJSX).replace(`    </div>\n  );\n}`, modalJSX);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Done');
