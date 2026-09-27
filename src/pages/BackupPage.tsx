import React, { useState, useEffect } from 'react';
import { 
  Database, Download, Calendar, Users, AlertTriangle, ShieldCheck, RefreshCw, 
  CheckCircle, HardDrive, Lock, RotateCcw, Clock, Trash2, ExternalLink, 
  Cloud, UploadCloud, Settings, Info, Save, Copy, Check 
} from 'lucide-react';

interface BackupRecord {
  _id: string;
  filename: string;
  sizeBytes: number;
  status: 'success' | 'failed';
  driveFileId?: string;
  driveUploadStatus?: 'uploaded' | 'failed' | 'skipped';
  errorMessage?: string;
  triggeredBy: 'scheduled' | 'manual';
  performedBy: string;
  createdAt: string;
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  backupTime: string;
  weekDay: number;
  retention: number;
  folderName: string;
  googleDriveLink?: string;
  googleDriveFolderId?: string;
  driveConnected: boolean;
  connectedEmail?: string;
  oauthConfigured?: boolean;
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

  // Settings Form state
  const [settingsForm, setSettingsForm] = useState({
    enabled: true,
    frequency: 'weekly' as 'weekly' | 'daily',
    weekDay: 0,
    backupTime: '02:00',
    retention: 7,
    googleDriveLink: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      alert('✅ Google Drive connected successfully! Scheduled backups will now automatically upload directly to your Google Drive folder.');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchBackupData();
    } else if (params.get('google_error')) {
      alert('❌ Google Drive authorization error: ' + params.get('google_error'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
        const s: BackupSettings = await settingsRes.json();
        setBackupSettings(s);
        setSettingsForm({
          enabled: s.enabled ?? true,
          frequency: s.frequency || 'weekly',
          weekDay: s.weekDay ?? 0,
          backupTime: s.backupTime || '02:00',
          retention: s.retention || 7,
          googleDriveLink: s.googleDriveLink || ''
        });
      }
    } catch (err) {
      console.error('Error fetching backup data:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        setBackupSettings(data.settings);
        setSettingsSavedMsg(true);
        setTimeout(() => setSettingsSavedMsg(false), 5000);
      } else {
        alert(data.message || 'Failed to update backup settings');
      }
    } catch (err: any) {
      alert('Error updating backup settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConnectDrive = async () => {
    setConnectingDrive(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/auth/url`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setShowOAuthGuide(true);
      }
    } catch (err) {
      setShowOAuthGuide(true);
    } finally {
      setConnectingDrive(false);
    }
  };

  const handleDisconnectDrive = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Drive? Backups will continue running on schedule and be safely archived locally.')) {
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/disconnect-drive`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchBackupData();
      }
    } catch (err: any) {
      alert('Error disconnecting Google Drive: ' + err.message);
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

  const handleDownloadBackup = (id: string, _filename: string) => {
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
    if (!window.confirm('Are you sure you want to permanently delete this backup record and its archive?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/backup/history/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setBackupRecords(prev => prev.filter(r => r._id !== id));
      } else {
        alert('Failed to delete backup record');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders?startDate=${customerDateRange.start}&endDate=${customerDateRange.end}T23:59:59.999Z&limit=10000`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      
      const orders = data.data || [];
      const headers = ['Order ID', 'Customer Name', 'Mobile Number', 'Email', 'Event Type', 'Total Amount', 'Advance Paid', 'Balance Due', 'Status', 'Event Date', 'Created Date'];
      
      const rows = orders.map((o: any) => [
        o.orderId || o._id,
        `"${o.customerName || ''}"`,
        o.customerMobile || '',
        o.customerEmail || '',
        `"${o.eventType || ''}"`,
        o.totalAmount || 0,
        o.advanceAmount || 0,
        (o.totalAmount || 0) - (o.advanceAmount || 0),
        o.status || '',
        o.eventDate ? new Date(o.eventDate).toLocaleDateString() : '',
        new Date(o.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      downloadCSV(csvContent, `ganga_customers_orders_${customerDateRange.start}_to_${customerDateRange.end}.csv`);
    } catch (err) {
      console.error(err);
      alert('Error exporting customer records');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/employees?limit=10000`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      
      const employees = data.data || [];
      const headers = ['Employee ID', 'Name', 'Email', 'Mobile', 'Designation', 'Status', 'Joining Date', 'Address'];
      
      const rows = employees.map((e: any) => [
        e.employeeId || e._id,
        `"${e.name || ''}"`,
        e.email || '',
        e.phone || e.mobile || '',
        `"${e.role || e.designation || ''}"`,
        e.status || '',
        e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : '',
        `"${(e.address || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      downloadCSV(csvContent, `ganga_employees_roster_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert('Error exporting employee records');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/schedule`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const data = await res.json();
      
      const events = data.data || [];
      const headers = ['Event ID', 'Title', 'Date', 'Time', 'Location', 'Assigned Photographer', 'Assigned Cinematographer', 'Status', 'Notes'];
      
      const rows = events.map((ev: any) => [
        ev._id,
        `"${ev.title || ''}"`,
        ev.date ? new Date(ev.date).toLocaleDateString() : '',
        `"${ev.time || ''}"`,
        `"${(ev.location || '').replace(/"/g, '""')}"`,
        `"${ev.assignedPhotographer || ''}"`,
        `"${ev.assignedCinematographer || ''}"`,
        ev.status || '',
        `"${(ev.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      downloadCSV(csvContent, `ganga_shoot_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert('Error exporting schedule');
    } finally {
      setLoading(false);
    }
  };

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title mb-1 flex items-center gap-2">
            <HardDrive className="text-yellow-500" size={28} /> System Backup & Recovery
          </h1>
          <p className="text-[var(--theme-text-muted)] text-sm">Automated AES-256-GCM encrypted database snapshots, Google Drive sync, and CSV exports.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] p-1 rounded-xl border border-[var(--theme-border)]">
          {role === 'owner' && (
            <button
              onClick={() => setActiveTab('encrypted')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
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
          {/* Security Banner & Quick Actions */}
          <div className="p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-main)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-500 font-semibold text-sm">
                <Lock size={18} />
                <span>AES-256-GCM Military-Grade Encryption Active</span>
              </div>
              <p className="text-sm text-[var(--theme-text-muted)] max-w-xl">
                Database backups are securely exported, gzip-compressed, and encrypted with authenticated AES-256-GCM. Backups can be synced to Google Drive, downloaded offline, or restored with one click.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[var(--theme-text-muted)]">
                <span>Schedule: <strong>{backupSettings?.enabled ? `${backupSettings?.frequency === 'weekly' ? `Weekly (${weekdayNames[backupSettings?.weekDay ?? 0]})` : 'Daily'} at ${backupSettings?.backupTime || '02:00'}` : 'Manual Only'}</strong></span>
                <span>•</span>
                <span>Retention: <strong>{backupSettings?.retention === -1 ? 'Keep All' : `${backupSettings?.retention || 7} days`}</strong></span>
                <span>•</span>
                <span>Google Drive: <strong>{backupSettings?.driveConnected ? `Connected (${backupSettings?.connectedEmail})` : 'Pending OAuth Setup'}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={fetchBackupData}
                disabled={loadingBackups}
                className="p-3 border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-bg-alt)] rounded-xl transition-all cursor-pointer"
                title="Refresh Backups"
              >
                <RefreshCw size={18} className={loadingBackups ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleTriggerBackup}
                disabled={creatingBackup}
                className="flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
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

          {/* Automated Weekly Schedule & Google Drive Destination Card */}
          <div className="p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-main)] shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--theme-text)] flex items-center gap-2">
                  <Cloud className="text-yellow-500" size={20} />
                  Automated Weekly Cloud Backup & Google Drive Destination
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)]">
                  Save your Google Drive folder link for automated updates. Backups run weekly on your chosen day and time.
                </p>
              </div>

              {/* Drive Connection Status Pill */}
              <div className="flex items-center gap-2">
                {backupSettings?.driveConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                    <CheckCircle size={14} />
                    <span>Drive Connected: {backupSettings.connectedEmail || 'Active'}</span>
                    <button
                      type="button"
                      onClick={handleDisconnectDrive}
                      className="ml-2 text-red-400 hover:text-red-300 underline font-normal cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <AlertTriangle size={14} />
                    <span>Google OAuth Setup Pending</span>
                  </div>
                )}
              </div>
            </div>

            {settingsSavedMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Backup schedule and Google Drive folder settings saved successfully! The background scheduler has been refreshed.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Google Drive Link Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--theme-text)]">
                    Google Drive Folder Link / ID
                  </label>
                  {backupSettings?.googleDriveFolderId && (
                    <a
                      href={`https://drive.google.com/drive/folders/${backupSettings.googleDriveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-yellow-500 hover:underline flex items-center gap-1 font-medium"
                    >
                      Open Google Drive Folder <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsForm.googleDriveLink}
                    onChange={(e) => setSettingsForm({ ...settingsForm, googleDriveLink: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] text-[var(--theme-text)] text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--theme-text-muted)] pt-1">
                  <span>Paste any Google Drive folder URL or Folder ID. The system automatically detects and extracts the folder ID.</span>
                  {backupSettings?.googleDriveFolderId && (
                    <span className="font-mono bg-[var(--theme-bg-alt)] px-2 py-0.5 rounded border border-[var(--theme-border)] text-yellow-500">
                      Detected ID: {backupSettings.googleDriveFolderId}
                    </span>
                  )}
                </div>
              </div>

              {/* Schedule Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {/* Auto Backup Enabled */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)]">
                    Automatic Backups
                  </label>
                  <select
                    value={settingsForm.enabled ? 'true' : 'false'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, enabled: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] text-[var(--theme-text)] text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="true">Enabled (Active)</option>
                    <option value="false">Disabled (Manual Only)</option>
                  </select>
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)]">
                    Frequency
                  </label>
                  <select
                    value={settingsForm.frequency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, frequency: e.target.value as 'weekly' | 'daily' })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] text-[var(--theme-text)] text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="weekly">Weekly (Recommended)</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                {/* Day of Week (if Weekly) */}
                {settingsForm.frequency === 'weekly' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--theme-text-muted)]">
                      Backup Day
                    </label>
                    <select
                      value={settingsForm.weekDay}
                      onChange={(e) => setSettingsForm({ ...settingsForm, weekDay: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] text-[var(--theme-text)] text-sm focus:outline-none focus:border-yellow-500"
                    >
                      <option value={0}>Every Sunday</option>
                      <option value={1}>Every Monday</option>
                      <option value={2}>Every Tuesday</option>
                      <option value={3}>Every Wednesday</option>
                      <option value={4}>Every Thursday</option>
                      <option value={5}>Every Friday</option>
                      <option value={6}>Every Saturday</option>
                    </select>
                  </div>
                )}

                {/* Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)]">
                    Backup Time (IST)
                  </label>
                  <input
                    type="time"
                    value={settingsForm.backupTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, backupTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] text-[var(--theme-text)] text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>

                {/* Retention */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)]">
                    Retention
                  </label>
                  <select
                    value={settingsForm.retention}
                    onChange={(e) => setSettingsForm({ ...settingsForm, retention: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-alt,rgba(0,0,0,0.1))] text-[var(--theme-text)] text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value={7}>Keep last 7 backups</option>
                    <option value={14}>Keep last 14 backups</option>
                    <option value={30}>Keep last 30 backups</option>
                    <option value={-1}>Keep all archives</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--theme-border)]">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl text-sm shadow transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {savingSettings ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>Save Schedule & Drive Settings</span>
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  {!backupSettings?.driveConnected && (
                    <button
                      type="button"
                      onClick={handleConnectDrive}
                      disabled={connectingDrive}
                      className="px-4 py-2.5 border border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-500 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <UploadCloud size={16} />
                      <span>{connectingDrive ? 'Connecting...' : 'Connect Google Drive Account'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowOAuthGuide(!showOAuthGuide)}
                    className="px-3 py-2 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] flex items-center gap-1.5 cursor-pointer underline"
                  >
                    <Info size={14} />
                    <span>{showOAuthGuide ? 'Hide Cloud Console Guide' : 'How to set up Google OAuth credentials later'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Collapsible Google Cloud Console Setup Instructions */}
            {showOAuthGuide && (
              <div className="p-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-4 text-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-yellow-500 flex items-center gap-2 text-sm">
                    <Settings size={16} /> Google Cloud Console OAuth 2.0 Credentials Setup Guide
                  </h4>
                  <button
                    onClick={() => setShowOAuthGuide(false)}
                    className="text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-[var(--theme-text-muted)]">
                  When you are ready to set up your Google Cloud OAuth authorization credentials, follow these simple steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--theme-text)] pl-1">
                  <li>
                    Visit the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-yellow-500 underline font-semibold">Google Cloud Console (Credentials)</a> and create or select your project.
                  </li>
                  <li>
                    Navigate to <strong>APIs & Services &gt; Library</strong>, search for <strong>Google Drive API</strong>, and click <strong>Enable</strong>.
                  </li>
                  <li>
                    Go to <strong>APIs & Services &gt; Credentials</strong>, click <strong>Create Credentials &gt; OAuth client ID</strong>.
                    <div className="ml-5 mt-1 text-[var(--theme-text-muted)]">
                      • Application type: <strong>Web application</strong><br />
                      • Name: <strong>Ganga Photo Studio ERP Backup</strong>
                    </div>
                  </li>
                  <li>
                    Under <strong>Authorized redirect URIs</strong>, add this exact callback URL:
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 ml-5">
                      <code className="px-3 py-1.5 rounded-lg bg-[var(--theme-bg-alt)] border border-[var(--theme-border)] text-yellow-500 font-mono text-xs select-all">
                        {typeof window !== 'undefined' ? `${(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')}/api/backup/auth/callback` : 'https://ganga-photo-studio-backend.onrender.com/api/backup/auth/callback'}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = `${(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')}/api/backup/auth/callback`;
                          navigator.clipboard.writeText(uri);
                          setCopiedRedirectUri(true);
                          setTimeout(() => setCopiedRedirectUri(false), 3000);
                        }}
                        className="px-2.5 py-1 text-xs border border-[var(--theme-border)] rounded-md hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedRedirectUri ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        <span>{copiedRedirectUri ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </li>
                  <li>
                    Copy your <strong>Client ID</strong> and <strong>Client Secret</strong>, and add them to your environment variables (e.g. in your Render Dashboard under Environment):
                    <div className="ml-5 mt-1 font-mono text-[11px] text-[var(--theme-text-muted)] bg-[var(--theme-bg-alt)] p-2 rounded border border-[var(--theme-border)]">
                      GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com<br />
                      GOOGLE_CLIENT_SECRET = your-google-client-secret
                    </div>
                  </li>
                  <li>
                    After saving the credentials in Render, return to this page and click <strong>"Connect Google Drive Account"</strong>. Once connected, your weekly backups will automatically stream directly into your specified Google Drive folder!
                  </li>
                </ol>
              </div>
            )}
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
                      <th className="py-3 px-4">Google Drive</th>
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
                        <td className="py-3 px-4">
                          {rec.driveUploadStatus === 'uploaded' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                              <UploadCloud size={12} /> Uploaded to Drive
                            </span>
                          ) : rec.driveUploadStatus === 'failed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20" title={rec.errorMessage}>
                              <AlertTriangle size={12} /> Upload Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                              <HardDrive size={12} /> Stored on Server
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[var(--theme-text-muted)]">
                          {rec.performedBy || rec.triggeredBy}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadBackup(rec._id, rec.filename)}
                              className="p-1.5 border border-[var(--theme-border)] hover:bg-yellow-500/10 text-[var(--theme-text)] hover:text-yellow-500 rounded-lg transition-colors cursor-pointer"
                              title="Download Encrypted File"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={() => handleRestoreBackup(rec._id, rec.filename)}
                              disabled={restoringId === rec._id}
                              className="p-1.5 border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Restore Database from Snapshot"
                            >
                              <RotateCcw size={15} className={restoringId === rec._id ? 'animate-spin' : ''} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec._id)}
                              className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
