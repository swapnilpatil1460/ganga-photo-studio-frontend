import React, { useState } from 'react';
import { Database, Download, Calendar, Users, AlertTriangle } from 'lucide-react';

const BackupPage = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  const [customerDateRange, setCustomerDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders?startDate=${customerDateRange.start}&endDate=${customerDateRange.end}T23:59:59.999Z`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const orders = await res.json();
      
      if (orders.length === 0) {
        alert("No records found for this date range.");
        setLoading(false);
        return;
      }

      // We will export a highly detailed table merging Customer and Order data
      const headers = [
        "Order ID", "Customer ID", "Customer Name", "Phone", 
        "Service", "Status", "Total Amount", "Paid Amount", "Unpaid Balance",
        "Order Date", "Expected Delivery"
      ];

      const rows = orders.map((o: any) => {
        const cId = typeof o.customer === 'object' ? (o.customer?.customerId || 'N/A') : 'N/A';
        const cName = typeof o.customer === 'object' ? (o.customer?.name || 'Walk-in') : 'Walk-in';
        const phone = typeof o.customer === 'object' ? (o.customer?.phone || 'N/A') : 'N/A';
        const total = o.totalAmount || 0;
        const paid = o.paidAmount || 0;
        const unpaid = total - paid;
        
        return [
          o.orderId,
          cId,
          `"${cName}"`,
          phone,
          o.service,
          o.status,
          total,
          paid,
          unpaid,
          new Date(o.createdAt).toLocaleDateString(),
          new Date(o.expectedDeliveryDate).toLocaleDateString()
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n");
      downloadCSV(csvContent, `Customer_Order_Backup_${customerDateRange.start}_to_${customerDateRange.end}.csv`);

    } catch (err) {
      console.error(err);
      alert("Error generating backup.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupEmployees = async () => {
    if (role !== 'owner') {
      alert("Only owners can export employee data.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const employees = await res.json();
      
      const headers = ["Employee ID", "Name", "Phone", "Email", "Role", "Status", "Date Joined"];
      
      const rows = employees.map((e: any) => [
        e.employeeId,
        `"${e.name}"`,
        e.phone,
        e.email || 'N/A',
        e.role,
        e.status,
        new Date(e.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n");
      downloadCSV(csvContent, `Employee_Directory_Backup_${new Date().toISOString().split('T')[0]}.csv`);

    } catch (err) {
      console.error(err);
      alert("Error generating employee backup.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/schedule`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const schedule = await res.json();
      
      const headers = ["Event Title", "Event Type", "Date", "Start Time", "End Time", "Location", "Customer Name", "Customer Phone", "Assigned To", "Notes"];
      
      const rows = schedule.map((e: any) => [
        `"${e.title}"`,
        e.type,
        e.date,
        e.startTime,
        e.endTime,
        `"${e.location || 'N/A'}"`,
        `"${e.customerName || 'N/A'}"`,
        e.customerNumber || 'N/A',
        `"${e.assignedTo || 'Unassigned'}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n");
      downloadCSV(csvContent, `Shoot_Schedule_Backup_${new Date().toISOString().split('T')[0]}.csv`);

    } catch (err) {
      console.error(err);
      alert("Error generating schedule backup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pb-12 pr-2">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-1">System Backup</h1>
          <p className="text-[var(--theme-text-muted)] text-sm">Export complete datasets to local disk for offline safekeeping.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Customer Backup Card */}
        <div className="profile-card flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[var(--theme-border)] pb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--theme-text)] text-lg">Customer & Orders Database</h3>
              <p className="text-[var(--theme-text-muted)] text-sm">Export complete customer details including payments, unpaid balances, and statuses.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-muted)]" size={18} />
                <input 
                  type="date"
                  value={customerDateRange.start}
                  onChange={(e) => setCustomerDateRange({...customerDateRange, start: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-muted)]" size={18} />
                <input 
                  type="date"
                  value={customerDateRange.end}
                  onChange={(e) => setCustomerDateRange({...customerDateRange, end: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleBackupCustomers}
            disabled={loading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={18} /> Export Customer Records to CSV
          </button>
        </div>

        {/* Employee Backup Card */}
        <div className="profile-card flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[var(--theme-border)] pb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--theme-text)] text-lg">Employee Directory</h3>
              <p className="text-[var(--theme-text-muted)] text-sm">Export complete employee contact information, roles, and employment dates.</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            {role !== 'owner' ? (
              <>
                <AlertTriangle size={48} className="text-red-400 mb-4 opacity-50" />
                <p className="text-[var(--theme-text)] font-medium">Restricted Access</p>
                <p className="text-[var(--theme-text-muted)] text-sm mt-2 max-w-xs">Employee records contain sensitive contact information. Only the Owner can export this data.</p>
              </>
            ) : (
              <>
                <Database size={48} className="text-gray-600 mb-4 opacity-50" />
                <p className="text-[var(--theme-text)] font-medium">Full Roster Backup</p>
                <p className="text-[var(--theme-text-muted)] text-sm mt-2 max-w-xs">Instantly generate a full export of all active and inactive employees.</p>
              </>
            )}
          </div>
          
          <button 
            onClick={handleBackupEmployees}
            disabled={loading || role !== 'owner'}
            className="w-full mt-auto py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-muted)] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Download size={18} /> {role === 'owner' ? "Export Employees" : "Owner Privilege Required"}
          </button>
        </div>

        {/* Schedule Backup Card */}
        <div className="profile-card flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[var(--theme-border)] pb-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--theme-text)] text-lg">Shoot Schedule</h3>
              <p className="text-[var(--theme-text-muted)] text-sm">Export all upcoming and past shoot events.</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
             <Calendar size={48} className="text-gray-600 mb-4 opacity-50" />
             <p className="text-[var(--theme-text)] font-medium">Full Schedule Backup</p>
             <p className="text-[var(--theme-text-muted)] text-sm mt-2 max-w-xs">Generate an export of all scheduled events including assignments and locations.</p>
          </div>
          
          <button 
            onClick={handleBackupSchedule}
            disabled={loading}
            className="w-full mt-auto py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export Shoot Schedule
          </button>
        </div>

      </div>
    </div>
  );
};

export default BackupPage;
