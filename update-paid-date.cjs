const fs = require('fs');

let c = fs.readFileSync('src/pages/EmployeeSalaryPage.tsx', 'utf8');

// 1. Add paymentDate state
c = c.replace(
  `  const [transactionRef, setTransactionRef] = useState('');`,
  `  const [transactionRef, setTransactionRef] = useState('');\n  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);`
);

// 2. Add paymentDate to fetch body in confirmPayment
c = c.replace(
  `body: JSON.stringify({ transactionReference: cleanRef })`,
  `body: JSON.stringify({ transactionReference: cleanRef, paymentDate })`
);

// 3. Add paymentDate input to modal
const newModalInput = `            <div className="form-group mb-4">
              <label>Payment Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                className="form-input" 
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="form-group mb-6">
              <label>Transaction Reference No. <span className="text-red-500">*</span></label>`;
              
c = c.replace(
  `<div className="form-group mb-6">
              <label>Transaction Reference No. <span className="text-red-500">*</span></label>`,
  newModalInput
);

// 4. Show Payment Date and Ref in UI if paid
const paidBadge = `{currentRecord?.status === 'Paid' && (
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 mb-1">Paid</span>
                  {currentRecord.paymentDetails && (
                    <div className="text-xs text-[var(--theme-text-muted)] text-right">
                      Paid on: {new Date(currentRecord.paymentDetails.paymentDate).toLocaleDateString()}<br/>
                      Ref: {currentRecord.paymentDetails.transactionReference}
                    </div>
                  )}
                </div>
              )}`;
              
c = c.replace(
  `{currentRecord?.status === 'Paid' && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Paid</span>
              )}`,
  paidBadge
);

fs.writeFileSync('src/pages/EmployeeSalaryPage.tsx', c);
console.log('Payment date added');
