import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Languages, Moon, Calendar, MessageSquare, Bell, ChevronDown,
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  UserSquare2, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut,
  Camera,
  Database,
  CalendarDays
} from 'lucide-react';

const SidebarItem = ({ icon, label, path }: { icon: React.ReactNode, label: string, path: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;
  
  return (
    <div 
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={() => navigate(path)}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};


const Dashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('themePreference') || 'theme-dashboard');
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'employee';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className={`dashboard-layout ${theme}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="overflow-hidden flex items-center justify-center p-0 rounded-full border border-[#c9a15a]">
            <img src="/logo.jpg" alt="Logo" className="w-14 h-14 object-cover" />
          </div>
          <span className="sidebar-title">Ganga Studio</span>
        </div>
        
        <nav className="sidebar-nav">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard" />
          <SidebarItem icon={<ShoppingCart size={20} />} label="Orders" path="/dashboard/orders" />
          <SidebarItem icon={<Users size={20} />} label="Customers" path="/dashboard/customers" />
          <SidebarItem icon={<CalendarDays size={20} />} label="Shoot Schedule" path="/dashboard/schedule" />
          
          {role === 'owner' && (
            <>
              <SidebarItem icon={<DollarSign size={20} />} label="Pricing" path="/dashboard/pricing" />
              <SidebarItem icon={<FileText size={20} />} label="Billing" path="/dashboard/billing" />
              <SidebarItem icon={<FileText size={20} />} label="Reports" path="/dashboard/reports" />
              <SidebarItem icon={<UserSquare2 size={20} />} label="Employees" path="/dashboard/employees" />
              <SidebarItem icon={<Users size={20} />} label="System Users" path="/dashboard/users" />
            </>
          )}

          <SidebarItem icon={<Database size={20} />} label="Backup" path="/dashboard/backup" />

          {role === 'owner' && (
            <SidebarItem icon={<Settings size={20} />} label="Settings" path="/dashboard/settings" />
          )}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="btn-logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Topnav */}
        <header className="dashboard-topnav">
          {/* Left: Search */}
          <div className="topnav-search">
            <Search size={18} className="icon-search" />
            <input 
              type="text" 
              placeholder="Search here..." 
              className="input-search"
            />
          </div>

          {/* Right: Icons & Profile */}
          <div className="topnav-right">
            <div className="topnav-icons">
              <div className="icon-btn">
                <Languages size={20} />
                <ChevronDown size={14} style={{marginLeft: '2px'}} />
              </div>
              <div className="icon-btn"><Moon size={20} /></div>
              <div className="icon-btn"><Calendar size={20} /></div>
              
              <div className="icon-btn has-badge">
                <MessageSquare size={20} />
                <span className="badge-bubble">5</span>
              </div>
              
              <div className="icon-btn has-badge">
                <Bell size={20} />
                <span className="badge-bubble">3</span>
              </div>
            </div>

            <div className="topnav-profile relative" onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{role === 'owner' ? 'Studio Owner' : 'Studio Employee'}</p>
                    <p className="dropdown-email">{role === 'owner' ? 'owner@ganga.com' : 'emp@ganga.com'}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="dropdown-logout"
                  >
                    <LogOut size={16} className="logout-icon" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <Outlet context={{ theme, setTheme }} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
