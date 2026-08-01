import React from 'react';
import { CreditCard, Download, Receipt } from 'lucide-react';

const BillingPage = () => {
  const mockInvoices = [
    { id: 'INV-2023-001', date: '2023-10-01', amount: 15000, status: 'Paid' },
    { id: 'INV-2023-002', date: '2023-11-01', amount: 15000, status: 'Paid' },
    { id: 'INV-2023-003', date: '2023-12-01', amount: 15000, status: 'Pending' },
  ];

  return (
    <div className="page-container max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar pb-12 pr-2">
      <div className="page-header mb-8">
        <h1 className="page-title mb-1 text-white">Billing & Subscriptions</h1>
        <p className="text-[var(--theme-text-muted)] text-sm">Manage your studio subscription and billing history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="profile-card md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Current Plan: Pro Studio</h3>
            <p className="text-[var(--theme-text-muted)] text-sm mb-4">You are on the professional tier. Next billing date is Jan 1, 2024.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors">
              Upgrade Plan
            </button>
            <button className="border border-[var(--theme-border)] text-white px-4 py-2 rounded-lg hover:bg-[var(--theme-bg-main)] transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>
        
        <div className="profile-card flex flex-col justify-center items-center text-center">
          <CreditCard size={48} className="text-[var(--theme-text-muted)] mb-4" />
          <h4 className="font-medium text-white mb-1">Payment Method</h4>
          <p className="text-sm text-[var(--theme-text-muted)]">Visa ending in 4242</p>
          <button className="text-yellow-500 text-sm mt-4 hover:underline">Update Method</button>
        </div>
      </div>

      <div className="table-container">
        <div className="p-4 border-b border-[var(--theme-border)]">
          <h3 className="font-semibold text-white">Billing History</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium text-white">{inv.id}</td>
                <td className="text-gray-300">{inv.date}</td>
                <td className="text-gray-300">₹{inv.amount.toLocaleString()}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <button className="text-[var(--theme-text-muted)] hover:text-yellow-500 transition-colors">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingPage;
