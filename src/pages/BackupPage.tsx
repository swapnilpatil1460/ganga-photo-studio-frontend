import React, { useState, useEffect } from 'react';
import { Database, Download, Calendar, Users, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle, HardDrive, Lock, RotateCcw, Clock, Trash2 } from 'lucide-react';

interface BackupRecord {
  _id: string;
  filename: string;
  sizeBytes: number;
  status: 'success' | 'failed';
  triggeredBy: 'scheduled' | 'manual';
  performedBy: string;
  createdAt: string;
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  backupTime: string;
  retention: number;
  lastBackupAt?: string;
  lastBackupStatus?: 'success' | 'failed';
}

const BackupPage = () => {
  const role = localStorage.getItem('role');
  const [activeTab, setActiveTab] = useState<'encrypted' | 'csv'>(role === 'owner' ? 'encrypted' : 'csv');

  // Encrypted Backup state
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // CSV export state
  const [customerDateRange, setCustomerDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'owner') {
      fetchBackupData();
    }
  }, [role]);

  const fetchBackupData = async () => {
    setLoadingBackups(true);
    try {
      const [historyRes, settingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/history`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/settings`, { credentials: 'include' })
      ]);
      if (historyRes.ok) {
        setBackupRecords(await historyRes.json());
      }
      if (settingsRes.ok) {
        setBackupSettings(await settingsRes.json());
      }
    } catch (err) {
      console.error('Error fetching backup data:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleTriggerBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/run`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Encrypted backup created successfully!');
        fetchBackupData();
      } else {
        alert(data.message || 'Backup failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during backup creation.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = (id: string, filename: string) => {
    window.open(`${import.meta.env.VITE_API_URL || ''}/api/backup/download/${id}`, '_blank');
  };

  const handleRestoreBackup = async (id: string, filename: string) => {
    const confirmed = window.confirm(
      `⚠️ CAUTION: Are you sure you want to restore from "${filename}"?\n\nThis will replace the current database contents with data from this snapshot.`
    );
    if (!confirmed) return;

    setRestoringId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/restore/${id}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Restore completed successfully!\n\nRestored collections:\n${JSON.stringify(data.restoredCollections, null, 2)}`);
      } else {
        alert(data.message || 'Restoration failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during restoration.');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Delete this backup archive permanently?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/history/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setBackupRecords(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // CSV Helpers
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders?startDate=${customerDateRange.start}&endDate=${customerDateRange.end}T23:59:59.999Z&limit=10000`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      const orders = result.data || result;
      
      if (orders.length === 0) {
        alert('No records found for this date range.');
        setLoading(false);
        return;
      }

      const headers = [
        'Order ID', 'Customer ID', 'Customer Name', 'Phone', 
        'Service', 'Status', 'Total Amount', 'Paid Amount', 'Unpaid Balance',
        'Order Date', 'Expected Delivery'
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

      const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
      downloadCSV(csvContent, `Customer_Order_Backup_${customerDateRange.start}_to_${customerDateRange.end}.csv`);
    } catch (err) {
      console.error(err);
      alert('Error generating backup.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupEmployees = async () => {
    if (role !== 'owner') {
      alert('Only owners can export employee data.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/employees?limit=10000`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const result = await res.json();
      const employees = result.data || result;
      
      const headers = ['Employee ID', 'Name', 'Phone', 'Email', 'Role', 'Status', 'Date Joined'];
      const rows = employees.map((e: any) => [
        e._id,
        `"${e.name}"`,
        e.phone,
        e.email,
        e.role,
        e.status,
        new Date(e.dateJoined).toLocaleDateString()
      ]);

      const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
      downloadCSV(csvContent, `Employee_Directory_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert('Error generating employee backup.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/schedule`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const events = await res.json();
      
      const headers = ['Event Title', 'Event Type', 'Date', 'Start Time', 'End Time', 'Location', 'Customer Name', 'Customer Phone', 'Assigned Staff', 'Notes'];
      const rows = events.map((e: any) => [
        `"${e.title}"`,
        e.type,
        new Date(e.date).toLocaleDateString(),
        e.startTime,
        e.endTime,
        `"${e.location || 'N/A'}"`,
        `"${e.customerName || 'N/A'}"`,
        e.customerNumber || 'N/A',
        `"${e.assignedTo || 'Unassigned'}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
      downloadCSV(csvContent, `Shoot_Schedule_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert('Error generating schedule backup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pb-12 pr-2">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title mb-1 flex items-center gap-2">
            <HardDrive className="text-yellow-500" size={28} /> System Backup & Recovery
          </h1>
          <p className="text-[var(--theme-text-muted)] text-sm">Automated AES-256-GCM encrypted database snapshots and CSV exports.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] p-1 rounded-xl border border-[var(--theme-border)]">
          {role === 'owner' && (
            <button
              onClick={() => setActiveTab('encrypted')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'encrypted'
                  ? 'bg-yellow-500 text-black shadow-sm'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              <ShieldCheck size={16} /> Encrypted Cloud Backups
            </button>
          )}
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'csv'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
            }`}
          >
            <Download size={16} /> CSV Exports
          </button>
        </div>
      </div>

      {/* TAB 1: Encrypted Backups */}
      {activeTab === 'encrypted' && role === 'owner' && (
        <div className="space-y-6">
          {/* Security Banner & Controls */}
          <div className="p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-main)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-500 font-semibold text-sm">
                <Lock size={18} />
                <span>AES-256-GCM Military-Grade Encryption Active</span>
              </div>
              <p className="text-sm text-[var(--theme-text-muted)] max-w-xl">
                Database backups are securely exported, gzip-compressed, and encrypted with authenticated AES-256-GCM. Backups can be downloaded for offline safe storage or restored with one click.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[var(--theme-text-muted)]">
                <span>Retention: <strong>{backupSettings?.retention || 7} days</strong></span>
                <span>•</span>
                <span>Auto-Backup: <strong>{backupSettings?.enabled ? 'Active (Daily 02:00)' : 'Manual Only'}</strong></span>
                <span>•</span>
                <span>Total Archives: <strong>{backupRecords.length}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={fetchBackupData}
                disabled={loadingBackups}
                className="p-3 border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-bg-alt)] rounded-xl transition-all"
                title="Refresh Backups"
              >
                <RefreshCw size={18} className={loadingBackups ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleTriggerBackup}
                disabled={creatingBackup}
                className="flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {creatingBackup ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Creating Backup...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Create Encrypted Backup Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Backup Archives Table */}
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-main)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
              <h2 className="font-bold text-[var(--theme-text)] flex items-center gap-2">
                <HardDrive size={18} className="text-yellow-500" /> Backup Archives
              </h2>
              <span className="text-xs text-[var(--theme-text-muted)]">Showing latest 50 snapshots</span>
            </div>

            {loadingBackups ? (
              <div className="p-12 text-center text-[var(--theme-text-muted)] flex flex-col items-center gap-2">
                <RefreshCw size={24} className="animate-spin text-yellow-500" />
                <p>Loading backup history...</p>
              </div>
            ) : backupRecords.length === 0 ? (
              <div className="p-12 text-center text-[var(--theme-text-muted)] space-y-2">
                <Database size={40} className="mx-auto opacity-40 text-yellow-500" />
                <p className="font-semibold text-[var(--theme-text)]">No backup archives yet</p>
                <p className="text-xs">Click "Create Encrypted Backup Now" above to generate your first AES-256 snapshot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--theme-bg-alt,rgba(0,0,0,0.05))] text-[var(--theme-text-muted)] text-xs uppercase border-b border-[var(--theme-border)]">
                    <tr>
                      <th className="py-3 px-4">Archive Filename</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Triggered By</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--theme-border)]">
                    {backupRecords.map(rec => (
                      <tr key={rec._id} className="hover:bg-[var(--theme-bg-alt,rgba(0,0,0,0.02))] transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[var(--theme-text)] flex items-center gap-2">
                          <Lock size={14} className="text-yellow-500 shrink-0" />
                          <span>{rec.filename}</span>
                        </td>
                        <td className="py-3 px-4 text-[var(--theme-text-muted)]">
                          {new Date(rec.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-[var(--theme-text)]">
                          {formatBytes(rec.sizeBytes)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            rec.status === 'success'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {rec.status === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--theme-text-muted)]">
                          {rec.performedBy || rec.triggeredBy}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadBackup(rec._id, rec.filename)}
                              className="p-1.5 border border-[var(--theme-border)] hover:bg-yellow-500/10 text-[var(--theme-text)] hover:text-yellow-500 rounded-lg transition-colors"
                              title="Download Encrypted File"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={() => handleRestoreBackup(rec._id, rec.filename)}
                              disabled={restoringId === rec._id}
                              className="p-1.5 border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Restore Database from Snapshot"
                            >
                              <RotateCcw size={15} className={restoringId === rec._id ? 'animate-spin' : ''} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec._id)}
                              className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Archive"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CSV Exports */}
      {activeTab === 'csv' && (
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
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
              className="w-full mt-auto py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download size={18} /> Export Shoot Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupPage;
