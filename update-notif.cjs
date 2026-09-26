const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

// 1. Add notification state
const statePattern = `  const [transactionRef, setTransactionRef] = useState('');`;
const newState = `  const [transactionRef, setTransactionRef] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };`;
c = c.replace(statePattern, newState);

// 2. Replace alerts with showNotification in handleCalculate
c = c.replace(
  `        alert('Salary calculated successfully!');`,
  `        showNotification('Salary calculated successfully!');`
);
c = c.replace(
  `        alert('Failed to calculate salary');`,
  `        showNotification('Failed to calculate salary', 'error');`
);
c = c.replace(
  `      alert('Error calculating salary');`,
  `      showNotification('Error calculating salary', 'error');`
);

// 3. Replace alerts in confirmPayment and openPaymentModal
c = c.replace(
  `      alert('Must calculate salary first before paying.');`,
  `      showNotification('Must calculate salary first before paying.', 'error');`
); // openPaymentModal

c = c.replace(
  `        alert('Failed to mark as paid');`,
  `        showNotification('Failed to mark as paid', 'error');`
); // confirmPayment

c = c.replace(
  `      alert('Error processing payment');`,
  `      showNotification('Error processing payment', 'error');`
); // confirmPayment


// 4. Render the notification UI at the end
const notifJSX = `
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 animate-slide-up z-50">
          <div className={\`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium \${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}\`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}`;

c = c.replace(`    </div>\r\n  );\r\n}`, notifJSX).replace(`    </div>\n  );\n}`, notifJSX);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Notification updated');
