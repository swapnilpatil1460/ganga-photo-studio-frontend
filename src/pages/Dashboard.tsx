import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Moon, Sun, Calendar, MessageSquare, Bell, ChevronDown,
  LayoutDashboard, ShoppingCart, Users, UserSquare2, DollarSign, 
  FileText, Settings, LogOut, Database, CalendarDays, Menu, X,
  Clock, CheckCircle, Package, AlertCircle, MapPin
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '') + '/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',});

// ── SidebarItem ──────────────────────────────────────────────────────────────
const SidebarItem = ({ icon, label, path, onClick }: { icon: React.ReactNode; label: string; path: string; onClick?: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;
  return (
    <div
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={() => { navigate(path); if (onClick) onClick(); }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

// ── Notification Panel ───────────────────────────────────────────────────────
const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders?limit=8&page=1`, {
      credentials: 'include', headers: authHeaders() });
        const data = await res.json();
        setNotifications(data.data || []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'Delivered') return <CheckCircle size={15} style={{ color: 'var(--theme-success)' }} />;
    if (status === 'Cancelled') return <AlertCircle size={15} style={{ color: 'var(--theme-danger)' }} />;
    return <Package size={15} style={{ color: 'var(--theme-warning)' }} />;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  return (
    <div className="header-panel notif-panel" onClick={e => e.stopPropagation()}>
      <div className="panel-header">
        <span className="panel-title"><Bell size={15} /> Notifications</span>
        <button className="panel-close" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="panel-body">
        {loading ? (
          <div className="panel-loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="panel-empty"><Bell size={32} /><p>No notifications</p></div>
        ) : (
          notifications.map((o: any) => (
            <div key={o._id} className="notif-item" onClick={() => { navigate('/dashboard/orders'); onClose(); }}>
              <span className="notif-icon-wrap">{getStatusIcon(o.status)}</span>
              <div className="notif-content">
                <p className="notif-title">{o.orderId} &mdash; {o.customer?.name || 'Customer'}</p>
                <p className="notif-msg">{o.service || 'Photography'} &bull; {o.status}</p>
                <p className="notif-time"><Clock size={10} /> {timeAgo(o.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="panel-footer">
        <button onClick={() => { navigate('/dashboard/orders'); onClose(); }}>View All Orders →</button>
      </div>
    </div>
  );
};

// ── Calendar Panel ───────────────────────────────────────────────────────────
const CalendarPanel = ({ onClose }: { onClose: () => void }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`${API_BASE}/schedule?page=1&limit=50`, {
      credentials: 'include', headers: authHeaders() });
        const data = await res.json();
        const upcoming = (data.data || []).filter((s: any) => s.date >= today).slice(0, 6);
        setSchedules(upcoming);
      } catch {
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const formatDate = (dateStr: string) => {
    if (dateStr === today) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const isToday = (dateStr: string) => dateStr === today;

  return (
    <div className="header-panel calendar-panel" onClick={e => e.stopPropagation()}>
      <div className="panel-header">
        <span className="panel-title"><Calendar size={15} /> Upcoming Shoots</span>
        <button className="panel-close" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="panel-body">
        {loading ? (
          <div className="panel-loading">Loading...</div>
        ) : schedules.length === 0 ? (
          <div className="panel-empty"><Calendar size={32} /><p>No upcoming schedules</p></div>
        ) : (
          schedules.map((s: any) => (
            <div key={s.id} className={`schedule-item ${isToday(s.date) ? 'today' : ''}`} onClick={() => { navigate('/dashboard/schedule'); onClose(); }}>
              <div className="schedule-date-badge">
                <span>{formatDate(s.date)}</span>
              </div>
              <div className="schedule-info">
                <p className="schedule-title">{s.title}</p>
                <p className="schedule-meta"><Clock size={10} /> {s.startTime} – {s.endTime}</p>
                {s.customerName && <p className="schedule-meta"><Users size={10} /> {s.customerName}</p>}
                {s.location && <p className="schedule-meta"><MapPin size={10} /> {s.location}</p>}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="panel-footer">
        <button onClick={() => { navigate('/dashboard/schedule'); onClose(); }}>View Full Schedule →</button>
      </div>
    </div>
  );
};

// ── Messages Panel ───────────────────────────────────────────────────────────
const MessagesPanel = ({ onClose }: { onClose: () => void }) => (
  <div className="header-panel messages-panel" onClick={e => e.stopPropagation()}>
    <div className="panel-header">
      <span className="panel-title"><MessageSquare size={15} /> Messages</span>
      <button className="panel-close" onClick={onClose}><X size={15} /></button>
    </div>
    <div className="panel-body">
      <div className="panel-empty">
        <MessageSquare size={36} />
        <p>Internal Messaging</p>
        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Coming soon</span>
      </div>
    </div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [isDark, setIsDark] = useState(localStorage.getItem('themeMode') !== 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'employee';
  const theme = isDark ? 'theme-dashboard' : 'theme-light';

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('themeMode', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  useEffect(() => {
    const pingServer = async () => {
      try {
        await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/ping', { method: 'POST', credentials: 'include' });
      } catch (e) {
        console.error('Ping failed:', e);
      }
    };
    
    // Ping immediately on mount, then every 60 seconds
    pingServer();
    const intervalId = setInterval(pingServer, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Close panels on outside click (panels close themselves via backdrop logic)
  useEffect(() => {
    // Other global click handlers could go here if needed
  }, []);

  const closeAllPanels = () => {
    setShowNotifications(false);
    setShowCalendar(false);
    setShowMessages(false);
    setShowProfileMenu(false);
  };

  return (
    <div className={`dashboard-layout ${theme}`} onClick={() => closeAllPanels()}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden flex items-center justify-center p-0 rounded-full border border-[#c9a15a] flex-shrink-0">
              <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover" />
            </div>
            <span className="sidebar-title">Ganga Studio</span>
          </div>
          <button 
            type="button"
            className="icon-btn text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
            title="Hide sidepanel"
            aria-label="Hide Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard" onClick={handleNavClick} />
          <SidebarItem icon={<ShoppingCart size={20} />} label="Orders" path="/dashboard/orders" onClick={handleNavClick} />
          <SidebarItem icon={<Users size={20} />} label="Customers" path="/dashboard/customers" onClick={handleNavClick} />
          <SidebarItem icon={<CalendarDays size={20} />} label="Shoot Schedule" path="/dashboard/schedule" onClick={handleNavClick} />

          {role === 'owner' && (
            <>
              <SidebarItem icon={<DollarSign size={20} />} label="Pricing" path="/dashboard/pricing" onClick={handleNavClick} />
              <SidebarItem icon={<FileText size={20} />} label="Billing" path="/dashboard/billing" onClick={handleNavClick} />
              <SidebarItem icon={<FileText size={20} />} label="Reports" path="/dashboard/reports" onClick={handleNavClick} />
              <SidebarItem icon={<UserSquare2 size={20} />} label="Employees" path="/dashboard/employees" onClick={handleNavClick} />
              <SidebarItem icon={<Users size={20} />} label="System Users" path="/dashboard/users" onClick={handleNavClick} />
            </>
          )}

          <SidebarItem icon={<Database size={20} />} label="Backup" path="/dashboard/backup" onClick={handleNavClick} />

          {role === 'owner' && (
            <SidebarItem icon={<Settings size={20} />} label="Settings" path="/dashboard/settings" onClick={handleNavClick} />
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main">
        <header className="dashboard-topnav">
          {/* Left: Hamburger Menu Button */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="icon-btn hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer"
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsSidebarOpen(prev => !prev); 
              }}
              title={isSidebarOpen ? "Hide sidepanel" : "Show sidepanel"}
              aria-label="Toggle Sidepanel"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Right: Action buttons */}
          <div className="topnav-right ml-auto">
            {/* Desktop only icons */}
            <div className="topnav-icons hidden md:flex">
              {/* Dark / Light Mode Toggle */}
              <div
                className="icon-btn"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                onClick={e => { e.stopPropagation(); toggleTheme(); }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </div>

              {/* Calendar quick-view */}
              <div
                className="icon-btn relative"
                title="Upcoming Shoots"
                onClick={e => { e.stopPropagation(); closeAllPanels(); setShowCalendar(prev => !prev); }}
              >
                <Calendar size={20} />
                {showCalendar && <CalendarPanel onClose={() => setShowCalendar(false)} />}
              </div>
            </div>

            {/* Always visible: Messages + Notifications */}
            <div className="topnav-icons flex">
              {/* Messages */}
              <div
                className="icon-btn has-badge relative"
                title="Messages"
                onClick={e => { e.stopPropagation(); closeAllPanels(); setShowMessages(prev => !prev); }}
              >
                <MessageSquare size={20} />
                <span className="badge-bubble">!</span>
                {showMessages && <MessagesPanel onClose={() => setShowMessages(false)} />}
              </div>

              {/* Notifications */}
              <div
                className="icon-btn has-badge relative"
                title="Notifications"
                onClick={e => { e.stopPropagation(); closeAllPanels(); setShowNotifications(prev => !prev); }}
              >
                <Bell size={20} />
                <span className="badge-bubble">new</span>
                {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
              </div>
            </div>

            {/* Profile Dropdown */}
            <div
              className="topnav-profile relative"
              onClick={e => { e.stopPropagation(); closeAllPanels(); setShowProfileMenu(prev => !prev); }}
            >
              <div className="avatar-wrapper">
                {role === 'owner' ? (
                  <img src="/owner.jpg" alt="Owner" className="avatar-img" />
                ) : (
                  <img src="https://i.pravatar.cc/150?img=68" alt="Employee" className="avatar-img" />
                )}
                <span className="online-dot"></span>
              </div>
              <ChevronDown size={16} className="icon-chevron" />

              {showProfileMenu && (
                <div className="profile-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <p className="dropdown-name">{role === 'owner' ? 'Studio Owner' : 'Studio Employee'}</p>
                    <p className="dropdown-email">{role === 'owner' ? 'owner@ganga.com' : 'emp@ganga.com'}</p>
                  </div>
                  <button onClick={handleLogout} className="dropdown-logout">
                    <LogOut size={16} className="logout-icon" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          <Outlet context={{ theme, setTheme: () => {} }} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
