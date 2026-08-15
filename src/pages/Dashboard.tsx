import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Moon, Sun, Calendar, MessageSquare, Bell, ChevronDown,
  LayoutDashboard, ShoppingCart, Users, UserSquare2, DollarSign, 
  FileText, Settings, LogOut, Database, CalendarDays, Menu, X,
  Clock, CheckCircle, Package, AlertCircle, MapPin
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

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
        const res = await fetch(`${API_BASE}/orders?limit=8&page=1`, { headers: authHeaders() });
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
        const res = await fetch(`${API_BASE}/schedule?page=1&limit=50`, { headers: authHeaders() });
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

// ── Search Dropdown ──────────────────────────────────────────────────────────
const SearchDropdown = ({ query, onClose }: { query: string; onClose: () => void }) => {
  const [results, setResults] = useState<{ orders: any[]; customers: any[] }>({ orders: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) { setResults({ orders: [], customers: [] }); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [oRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/orders?search=${encodeURIComponent(query)}&limit=4`, { headers: authHeaders() }),
          fetch(`${API_BASE}/customers?name=${encodeURIComponent(query)}&limit=4`, { headers: authHeaders() })
        ]);
        const oData = await oRes.json();
        const cData = await cRes.json();
        setResults({ orders: oData.data || [], customers: cData.data || [] });
      } catch {
        setResults({ orders: [], customers: [] });
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  if (query.length < 2) return null;

  const hasResults = results.orders.length > 0 || results.customers.length > 0;

  return (
    <div className="search-dropdown">
      {loading && <div className="search-loading">Searching...</div>}
      {!loading && !hasResults && <div className="search-empty">No results for "{query}"</div>}
      {results.orders.length > 0 && (
        <>
          <div className="search-section-label">Orders</div>
          {results.orders.map((o: any) => (
            <div key={o._id} className="search-result-item" onClick={() => { navigate('/dashboard/orders'); onClose(); }}>
              <ShoppingCart size={13} />
              <div>
                <p className="sr-title">{o.orderId}</p>
                <p className="sr-sub">{o.service} &bull; {o.status}</p>
              </div>
            </div>
          ))}
        </>
      )}
      {results.customers.length > 0 && (
        <>
          <div className="search-section-label">Customers</div>
          {results.customers.map((c: any) => (
            <div key={c._id} className="search-result-item" onClick={() => { navigate('/dashboard/customers'); onClose(); }}>
              <Users size={13} />
              <div>
                <p className="sr-title">{c.name}</p>
                <p className="sr-sub">{c.phone}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(localStorage.getItem('themeMode') !== 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'employee';
  const theme = isDark ? 'theme-dashboard' : 'theme-light';

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('themeMode', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setShowSearch(false);
      // Panels close themselves via their own backdrop logic / click handlers
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
        <div className="sidebar-header">
          <div className="overflow-hidden flex items-center justify-center p-0 rounded-full border border-[#c9a15a]">
            <img src="/logo.jpg" alt="Logo" className="w-14 h-14 object-cover" />
          </div>
          <span className="sidebar-title">Ganga Studio</span>
        </div>

        <nav className="sidebar-nav">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<ShoppingCart size={20} />} label="Orders" path="/dashboard/orders" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<Users size={20} />} label="Customers" path="/dashboard/customers" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<CalendarDays size={20} />} label="Shoot Schedule" path="/dashboard/schedule" onClick={() => setIsSidebarOpen(false)} />

          {role === 'owner' && (
            <>
              <SidebarItem icon={<DollarSign size={20} />} label="Pricing" path="/dashboard/pricing" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem icon={<FileText size={20} />} label="Billing" path="/dashboard/billing" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem icon={<FileText size={20} />} label="Reports" path="/dashboard/reports" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem icon={<UserSquare2 size={20} />} label="Employees" path="/dashboard/employees" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem icon={<Users size={20} />} label="System Users" path="/dashboard/users" onClick={() => setIsSidebarOpen(false)} />
            </>
          )}

          <SidebarItem icon={<Database size={20} />} label="Backup" path="/dashboard/backup" onClick={() => setIsSidebarOpen(false)} />

          {role === 'owner' && (
            <SidebarItem icon={<Settings size={20} />} label="Settings" path="/dashboard/settings" onClick={() => setIsSidebarOpen(false)} />
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
          {/* Left: Hamburger + Search */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="md:hidden icon-btn" onClick={e => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}>
              <Menu size={24} />
            </button>
            <div className="topnav-search hidden sm:flex relative" ref={searchRef}>
              <Search size={18} className="icon-search" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="input-search"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
              />
              {showSearch && searchQuery.length >= 2 && (
                <SearchDropdown query={searchQuery} onClose={() => { setShowSearch(false); setSearchQuery(''); }} />
              )}
            </div>
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
