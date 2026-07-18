import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, User,
  Trash2, AlertTriangle, CalendarDays, List
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Config — event types.                                               */
/* ------------------------------------------------------------------ */
const EVENT_TYPES = [
  { id: 'wedding',        label: 'Wedding',         dot: '#C9A24B', bg: 'rgba(201, 162, 75, 0.2)', text: 'var(--theme-text)' },
  { id: 'pre_wedding',    label: 'Pre-wedding',      dot: '#D4537E', bg: 'rgba(212, 83, 126, 0.2)', text: 'var(--theme-text)' },
  { id: 'studio',         label: 'Studio shoot',     dot: '#10B981', bg: 'rgba(16, 185, 129, 0.2)', text: 'var(--theme-text)' },
  { id: 'corporate',      label: 'Corporate',        dot: '#7F77DD', bg: 'rgba(127, 119, 221, 0.2)', text: 'var(--theme-text)' },
  { id: 'political_rally',label: 'Political rally',  dot: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)', text: 'var(--theme-text)' },
  { id: 'outdoor',        label: 'Outdoor',          dot: '#84CC16', bg: 'rgba(132, 204, 22, 0.2)', text: 'var(--theme-text)' },
  { id: 'other',          label: 'Other',            dot: '#888780', bg: 'rgba(136, 135, 128, 0.2)', text: 'var(--theme-text)' },
];
const typeInfo = (id: string) => EVENT_TYPES.find((t) => t.id === id) || EVENT_TYPES[EVENT_TYPES.length - 1];

const ROLES = ['Owner', 'Manager', 'Photographer', 'Receptionist'];
const canManage = (role: string) => role === 'Owner' || role === 'Manager';

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */
const pad = (n: number) => String(n).padStart(2, '0');
const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };

function getMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

const BLANK_FORM = { title: '', type: 'wedding', date: '', startTime: '10:00', endTime: '13:00', location: '', customerName: '', customerNumber: '', assignedTo: '', notes: '' };

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [role, setRole] = useState(localStorage.getItem('role') === 'owner' ? 'Owner' : 'Photographer');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [modal, setModal] = useState<any>(null); // { mode: 'add' | 'edit' | 'view', form }

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const manage = canManage(role);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = useMemo(() => getMonthGrid(year, month), [year, month]);
  const todayStr = toDateStr(new Date());

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.type === filter);
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredEvents.forEach((e) => { (map[e.date] ??= []).push(e); });
    Object.values(map).forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [filteredEvents]);

  const upcoming = useMemo(() => (
    [...events].filter((e) => e.date >= todayStr)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
      .slice(0, 6)
  ), [events, todayStr]);

  function findConflicts(form: any, excludeId: string | null) {
    if (!form.assignedTo || !form.date) return [];
    const names = form.assignedTo.split(',').map((n: string) => n.trim().toLowerCase()).filter(Boolean);
    if (!names.length) return [];
    return events.filter((e) => {
      if (e.id === excludeId || e.date !== form.date) return false;
      const eNames = e.assignedTo ? e.assignedTo.split(',').map((n: string) => n.trim().toLowerCase()) : [];
      const samePerson = names.some((n: string) => eNames.includes(n));
      return samePerson && form.startTime < e.endTime && e.startTime < form.endTime;
    });
  }

  const openAdd = (dateStr?: string) => manage && setModal({ mode: 'add', form: { ...BLANK_FORM, date: dateStr || todayStr } });
  const openEvent = (event: any) => setModal({ mode: manage ? 'edit' : 'view', form: { ...event } });
  const closeModal = () => setModal(null);
  const updateForm = (patch: any) => setModal((m: any) => ({ ...m, form: { ...m.form, ...patch } }));

  async function saveModal() {
    const { form, mode } = modal;
    if (!form.title?.trim()) {
      alert("Please enter an event title.");
      return;
    }
    if (!form.date) {
      alert("Please select a date.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = mode === 'add' ? 'http://localhost:5000/api/schedule' : `http://localhost:5000/api/schedule/${form.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        fetchEvents();
        closeModal();
      } else {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        alert(`Failed to save event: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error("Error saving schedule:", err);
      alert(`Network error: ${err.message || 'Could not connect to server'}`);
    }
  }

  async function deleteEvent() { 
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/schedule/${modal.form.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEvents();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  }

  const conflicts = modal && modal.mode !== 'view' ? findConflicts(modal.form, modal.mode === 'edit' ? modal.form.id : null) : [];
  const monthLabel = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="page-container h-full overflow-y-auto custom-scrollbar pr-2 pb-12">
      <style>{`
        .ss-btn { cursor:pointer; border:none; font-family:inherit; transition:opacity .15s ease, transform .1s ease; }
        .ss-btn:hover { opacity:.88; }
        .ss-btn:active { transform: scale(0.98); }
        .ss-cell:hover { background: var(--theme-bg-main) !important; }
        .ss-input, .ss-select, .ss-textarea {
          width:100%; background: var(--theme-bg-main); border: 1px solid var(--theme-border); color: var(--theme-text);
          border-radius:8px; padding:9px 11px; font-size:13.5px; font-family:inherit; box-sizing:border-box;
        }
        .ss-input:focus, .ss-select:focus, .ss-textarea:focus { outline:1.5px solid var(--color-yellow-500); }
        .ss-label { font-size:12px; color: var(--theme-text-muted); margin-bottom:5px; display:block; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={20} className="text-[var(--color-yellow-500)]" />
            <h1 className="page-title !mb-0">Shoot scheduling</h1>
          </div>
          <p className="text-[var(--theme-text-muted)] text-sm ml-7">Manage upcoming shoots and assignments</p>
        </div>

        <div className="flex items-center gap-3">
          <select className="ss-select !w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>View as: {r}</option>)}
          </select>
          <div className="flex bg-[var(--theme-bg-main)] rounded-lg p-1 border border-[var(--theme-border)]">
            <button className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-[var(--color-yellow-500)] text-black' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'}`} onClick={() => setViewMode('calendar')} title="Calendar View">
              <CalendarDays size={18} />
            </button>
            <button className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[var(--color-yellow-500)] text-black' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'}`} onClick={() => setViewMode('list')} title="List View">
              <List size={18} />
            </button>
          </div>
          {manage && (
            <button className="flex items-center gap-2 bg-[var(--color-yellow-500)] text-black font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-yellow-600)]" onClick={() => openAdd(todayStr)}>
              <Plus size={18} /> New event
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button className="ss-btn px-4 py-1.5 rounded-full text-sm font-medium border" 
          onClick={() => setFilter('all')}
          style={{ 
            background: filter === 'all' ? 'var(--color-yellow-500)' : 'var(--theme-bg-main)', 
            color: filter === 'all' ? '#000' : 'var(--theme-text-muted)',
            borderColor: filter === 'all' ? 'var(--color-yellow-500)' : 'var(--theme-border)'
          }}>
          All
        </button>
        {EVENT_TYPES.map((t) => (
          <button key={t.id} className="ss-btn px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2" 
            onClick={() => setFilter(t.id)}
            style={{ 
              background: filter === t.id ? t.bg : 'var(--theme-bg-main)', 
              color: filter === t.id ? t.text : 'var(--theme-text-muted)',
              borderColor: filter === t.id ? t.dot : 'var(--theme-border)'
            }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot }} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {viewMode === 'calendar' ? (
          <>
            {/* Calendar */}
            <div className="profile-card flex-[3] w-full min-w-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[var(--theme-text)]">{monthLabel}</span>
                <div className="flex gap-2">
                  <button className="ss-btn bg-[var(--theme-bg-main)] text-[var(--theme-text)] px-2 py-1.5 rounded-md border border-[var(--theme-border)]" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
                  <button className="ss-btn bg-[var(--theme-bg-main)] text-[var(--theme-text)] px-3 py-1.5 rounded-md border border-[var(--theme-border)] text-sm font-medium" onClick={() => setCurrentDate(new Date())}>Today</button>
                  <button className="ss-btn bg-[var(--theme-bg-main)] text-[var(--theme-text)] px-2 py-1.5 rounded-md border border-[var(--theme-border)]" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekdays.map((w) => <div key={w} className="text-xs font-medium text-[var(--theme-text-muted)] text-center py-1">{w}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((d) => {
                  const dateStr = toDateStr(d);
                  const inMonth = d.getMonth() === month;
                  const isToday = dateStr === todayStr;
                  const dayEvents = eventsByDate[dateStr] || [];
                  const visible = dayEvents.slice(0, 3);
                  const extra = dayEvents.length - visible.length;
                  return (
                    <div key={dateStr} className="ss-cell min-h-[90px] border border-[var(--theme-border)] rounded-lg p-1.5" 
                      onClick={() => openAdd(dateStr)}
                      style={{ cursor: manage ? 'pointer' : 'default', opacity: inMonth ? 1 : 0.4 }}>
                      <div className="flex justify-end">
                        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium ${isToday ? 'bg-[var(--color-yellow-500)] text-black' : 'text-[var(--theme-text-muted)]'}`}>
                          {d.getDate()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {visible.map((e) => {
                          const t = typeInfo(e.type);
                          return (
                            <div key={e.id} onClick={(ev) => { ev.stopPropagation(); openEvent(e); }}
                              className="text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer"
                              style={{ background: t.bg, color: t.text, border: `1px solid ${t.dot}40` }}>
                              <span className="opacity-75 mr-1">{e.startTime}</span>{e.title}
                            </div>
                          );
                        })}
                        {extra > 0 && <span className="text-[10px] text-[var(--theme-text-muted)] pl-1">+{extra} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar — upcoming events */}
            <div className="profile-card flex-1 w-full min-w-[300px]">
              <span className="text-lg font-semibold text-[var(--theme-text)]">Upcoming</span>
              <div className="flex flex-col gap-3 mt-4">
                {upcoming.length === 0 && <p className="text-sm text-[var(--theme-text-muted)]">No upcoming events scheduled.</p>}
                {upcoming.map((e) => {
                  const t = typeInfo(e.type);
                  const d = new Date(e.date + 'T00:00:00');
                  return (
                    <div key={e.id} onClick={() => openEvent(e)} className="ss-btn flex gap-3 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg p-3 text-left">
                      <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md w-11 min-w-[44px] h-11 flex flex-col items-center justify-center">
                        <span className="text-[var(--theme-text)] font-semibold text-sm leading-tight">{d.getDate()}</span>
                        <span className="text-[var(--theme-text-muted)] text-[10px] uppercase">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[var(--theme-text)] truncate">{e.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
                          <span className="text-xs text-[var(--theme-text-muted)]">{t.label} · {e.startTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="profile-card w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)] text-sm text-[var(--theme-text-muted)]">
                  <th className="pb-3 px-4 font-medium">Event</th>
                  <th className="pb-3 px-4 font-medium">Date & Time</th>
                  <th className="pb-3 px-4 font-medium">Customer</th>
                  <th className="pb-3 px-4 font-medium">Assigned To</th>
                  <th className="pb-3 px-4 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--theme-text-muted)]">No events found.</td>
                  </tr>
                ) : (
                  filteredEvents.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)).map((e) => {
                    const t = typeInfo(e.type);
                    return (
                      <tr key={e.id} onClick={() => openEvent(e)} className="border-b border-[var(--theme-border)] hover:bg-[var(--theme-bg-main)] cursor-pointer transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-medium text-[var(--theme-text)] group-hover:text-[var(--color-yellow-500)] transition-colors">{e.title}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
                            <span className="text-xs text-[var(--theme-text-muted)]">{t.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[var(--theme-text)]">{e.date}</div>
                          <div className="text-xs text-[var(--theme-text-muted)] mt-0.5">{e.startTime} – {e.endTime}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[var(--theme-text)]">{e.customerName || '—'}</div>
                          <div className="text-xs text-[var(--theme-text-muted)] mt-0.5">{e.customerNumber}</div>
                        </td>
                        <td className="py-3 px-4 text-[var(--theme-text)]">{e.assignedTo || '—'}</td>
                        <td className="py-3 px-4 text-[var(--theme-text-muted)] text-xs">{e.location || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal — add / edit / view */}
      {modal && (
        <div onClick={closeModal} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="profile-card w-[480px] max-w-full max-h-[90vh] overflow-y-auto !m-0 !p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-[var(--theme-text)]">
                {modal.mode === 'add' ? 'New event' : modal.mode === 'edit' ? 'Edit event' : 'Event details'}
              </span>
              <button className="ss-btn text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]" onClick={closeModal}><X size={20} /></button>
            </div>

            {conflicts.length > 0 && (
              <div className="flex gap-2 items-start bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm mb-5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>
                  Clash: {conflicts[0].assignedTo.split(',')[0]} is already on "{conflicts[0].title}" {conflicts[0].startTime}–{conflicts[0].endTime} that day.
                  {manage ? ' You can save anyway.' : ''}
                </span>
              </div>
            )}

            {modal.mode === 'view' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: typeInfo(modal.form.type).bg, color: typeInfo(modal.form.type).text, border: `1px solid ${typeInfo(modal.form.type).dot}40` }}>{typeInfo(modal.form.type).label}</span>
                  <h3 className="text-lg font-medium text-[var(--theme-text)] mt-3">{modal.form.title}</h3>
                </div>
                <div className="flex flex-col gap-2.5 text-sm text-[var(--theme-text-muted)] bg-[var(--theme-bg-main)] p-4 rounded-lg border border-[var(--theme-border)]">
                  <div className="flex gap-2.5 items-center"><Clock size={16} className="text-[var(--color-yellow-500)]" /> {modal.form.date} · {modal.form.startTime}–{modal.form.endTime}</div>
                  <div className="flex gap-2.5 items-center"><MapPin size={16} className="text-[var(--color-yellow-500)]" /> {modal.form.location || '—'}</div>
                  <div className="flex gap-2.5 items-center"><User size={16} className="text-[var(--color-yellow-500)]" /> Assigned: {modal.form.assignedTo || '—'}</div>
                  {(modal.form.customerName || modal.form.customerNumber) && (
                    <div className="flex gap-2.5 items-center pt-2 border-t border-[var(--theme-border)]">
                      <span className="font-medium">Customer:</span> 
                      {modal.form.customerName || '—'} {modal.form.customerNumber ? `(${modal.form.customerNumber})` : ''}
                    </div>
                  )}
                </div>
                {modal.form.notes && (
                  <div className="mt-2">
                    <label className="text-xs font-medium text-[var(--theme-text-muted)] uppercase tracking-wider mb-1 block">Notes</label>
                    <p className="text-sm text-[var(--theme-text)] bg-[var(--theme-bg-main)] p-3 rounded-lg border border-[var(--theme-border)]">{modal.form.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="ss-label">Event title</label>
                  <input className="ss-input" value={modal.form.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="e.g. Deshmukh Wedding — Day 1" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="ss-label">Event type</label>
                    <select className="ss-select" value={modal.form.type} onChange={(e) => updateForm({ type: e.target.value })}>
                      {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="ss-label">Date</label>
                    <input type="date" className="ss-input" value={modal.form.date} onChange={(e) => updateForm({ date: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="ss-label">Start time</label>
                    <input type="time" className="ss-input" value={modal.form.startTime} onChange={(e) => updateForm({ startTime: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="ss-label">End time</label>
                    <input type="time" className="ss-input" value={modal.form.endTime} onChange={(e) => updateForm({ endTime: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="ss-label">Location</label>
                  <input className="ss-input" value={modal.form.location} onChange={(e) => updateForm({ location: e.target.value })} placeholder="Studio A, or client venue" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="ss-label">Customer Name</label>
                    <input className="ss-input" value={modal.form.customerName || ''} onChange={(e) => updateForm({ customerName: e.target.value })} placeholder="e.g. Ramesh Patel" />
                  </div>
                  <div className="flex-1">
                    <label className="ss-label">Customer Phone</label>
                    <input className="ss-input" value={modal.form.customerNumber || ''} onChange={(e) => updateForm({ customerNumber: e.target.value })} placeholder="e.g. 9876543210" />
                  </div>
                </div>
                <div>
                  <label className="ss-label">Assigned to (comma separated)</label>
                  <input className="ss-input" value={modal.form.assignedTo} onChange={(e) => updateForm({ assignedTo: e.target.value })} placeholder="Rohan Patil, Anjali Shinde" />
                </div>
                <div>
                  <label className="ss-label">Notes</label>
                  <textarea className="ss-textarea" rows={3} value={modal.form.notes} onChange={(e) => updateForm({ notes: e.target.value })} placeholder="Optional instructions" />
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--theme-border)]">
                  {modal.mode === 'edit' ? (
                    <button className="ss-btn flex items-center gap-1.5 text-red-500 hover:text-red-400 text-sm font-medium" onClick={deleteEvent}>
                      <Trash2 size={16} /> Delete
                    </button>
                  ) : <span />}
                  <div className="flex gap-3">
                    <button className="ss-btn px-4 py-2 rounded-lg text-sm font-medium border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-bg-main)]" onClick={closeModal}>Cancel</button>
                    <button className="ss-btn px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-yellow-500)] text-black hover:bg-[var(--color-yellow-600)]" onClick={saveModal}>
                      {modal.mode === 'add' ? 'Create event' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
