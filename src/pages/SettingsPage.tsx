import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Moon, Sun, Building, Key, Bell, CreditCard, Save, CheckCircle2 } from 'lucide-react';

const SettingsPage = () => {
  const { theme, setTheme } = useOutletContext<{ theme: string, setTheme: (t: string) => void }>();
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Studio Profile State
  const [studioProfile, setStudioProfile] = useState({
    name: 'Ganga Photo Studio',
    email: 'contact@gangastudio.com',
    phone: '+91 98765 43210',
    address: '123 Photography Lane, Camera City',
    gstId: 'GSTIN1234567890'
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securitySaved, setSecuritySaved] = useState(false);

  useEffect(() => {
    // Load studio profile from local storage if exists
    const savedProfile = localStorage.getItem('studioProfile');
    if (savedProfile) {
      setStudioProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('themePreference', newTheme);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('studioProfile', JSON.stringify(studioProfile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    // Simulate API call for password change
    setSecuritySaved(true);
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSecuritySaved(false), 3000);
  };

  const getTabClass = (tab: string) => {
    return activeTab === tab
      ? "flex items-center gap-3 w-full text-left p-3 rounded-lg bg-[var(--theme-bg-main)] border border-[var(--color-yellow-500)] text-[var(--color-yellow-500)] font-medium transition-colors"
      : "flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-[var(--theme-bg-main)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-transparent transition-colors";
  };

  return (
    <div className="page-container max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar pb-12 pr-2">
      <div className="page-header mb-8">
        <h1 className="page-title mb-1">Settings</h1>
        <p className="text-[var(--theme-text-muted)] text-sm">Manage your studio preferences, theme, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column - Navigation/Tabs */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <button onClick={() => setActiveTab('appearance')} className={getTabClass('appearance')}>
            <Moon size={18} /> Appearance
          </button>
          <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>
            <Building size={18} /> Studio Profile
          </button>
          <button onClick={() => setActiveTab('security')} className={getTabClass('security')}>
            <Key size={18} /> Security
          </button>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* ---------------- APPEARANCE TAB ---------------- */}
          {activeTab === 'appearance' && (
            <div className="profile-card animate-fadeIn">
              <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4">Dashboard Theme</h3>
              <p className="text-[var(--theme-text-muted)] text-sm mb-6">Choose how the dashboard looks to you. This setting is saved to your browser.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Dark Theme Option */}
                <div 
                  onClick={() => handleThemeChange('theme-dashboard')}
                  className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${theme === 'theme-dashboard' ? 'border-[var(--color-yellow-500)] ring-4 ring-yellow-500/20' : 'border-[var(--theme-border)] hover:border-gray-400'}`}
                >
                  <div className="h-32 bg-[#1A1D24] flex items-center justify-center border-b border-[#343945]">
                    <div className="w-40 h-20 bg-[#242830] rounded border border-[#343945] flex flex-col p-3 gap-2 shadow-lg">
                      <div className="w-1/2 h-2 bg-[#343945] rounded"></div>
                      <div className="w-full h-2 bg-[#343945] rounded"></div>
                      <div className="w-3/4 h-2 bg-[#C9A24B] rounded mt-auto"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--theme-bg-main)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon size={16} className={theme === 'theme-dashboard' ? 'text-[var(--color-yellow-500)]' : 'text-[var(--theme-text-muted)]'} />
                      <span className="font-medium text-[var(--theme-text)]">Dark Gold Theme</span>
                    </div>
                    {theme === 'theme-dashboard' && <div className="w-3 h-3 rounded-full bg-[var(--color-yellow-500)]"></div>}
                  </div>
                </div>

                {/* Light Theme Option */}
                <div 
                  onClick={() => handleThemeChange('theme-light')}
                  className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${theme === 'theme-light' ? 'border-[var(--color-yellow-500)] ring-4 ring-yellow-500/20' : 'border-[var(--theme-border)] hover:border-gray-400'}`}
                >
                  <div className="h-32 bg-[#F3F4F6] flex items-center justify-center border-b border-[#E5E7EB]">
                    <div className="w-40 h-20 bg-white rounded border border-[#E5E7EB] flex flex-col p-3 gap-2 shadow-sm">
                      <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                      <div className="w-full h-2 bg-gray-200 rounded"></div>
                      <div className="w-3/4 h-2 bg-yellow-500 rounded mt-auto"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--theme-bg-main)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun size={16} className={theme === 'theme-light' ? 'text-[var(--color-yellow-500)]' : 'text-[var(--theme-text-muted)]'} />
                      <span className="font-medium text-[var(--theme-text)]">Light Theme</span>
                    </div>
                    {theme === 'theme-light' && <div className="w-3 h-3 rounded-full bg-[var(--color-yellow-500)]"></div>}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ---------------- STUDIO PROFILE TAB ---------------- */}
          {activeTab === 'profile' && (
            <div className="profile-card animate-fadeIn">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-1">Studio Profile</h3>
                  <p className="text-[var(--theme-text-muted)] text-sm">Update your business details. This information will appear on invoices and reports.</p>
                </div>
                {profileSaved && (
                  <span className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-500/10 px-3 py-1 rounded-full">
                    <CheckCircle2 size={16} /> Saved Successfully
                  </span>
                )}
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">Studio Name</label>
                    <input 
                      type="text" 
                      value={studioProfile.name}
                      onChange={(e) => setStudioProfile({...studioProfile, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      value={studioProfile.email}
                      onChange={(e) => setStudioProfile({...studioProfile, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={studioProfile.phone}
                      onChange={(e) => setStudioProfile({...studioProfile, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">Business Address</label>
                    <textarea 
                      value={studioProfile.address}
                      onChange={(e) => setStudioProfile({...studioProfile, address: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">GST / Tax ID</label>
                    <input 
                      type="text" 
                      value={studioProfile.gstId}
                      onChange={(e) => setStudioProfile({...studioProfile, gstId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--theme-border)]">
                  <button type="submit" className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* ---------------- SECURITY TAB ---------------- */}
          {activeTab === 'security' && (
            <div className="profile-card animate-fadeIn">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-1">Security Settings</h3>
                  <p className="text-[var(--theme-text-muted)] text-sm">Update your account password and manage authentication settings.</p>
                </div>
                {securitySaved && (
                  <span className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-500/10 px-3 py-1 rounded-full">
                    <CheckCircle2 size={16} /> Password Updated
                  </span>
                )}
              </div>
              
              <form onSubmit={handleSaveSecurity} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" 
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--theme-border)]">
                  <button type="submit" className="flex items-center gap-2 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] hover:bg-[var(--theme-text)] hover:text-[var(--theme-bg)] text-[var(--theme-text)] font-semibold py-2 px-6 rounded-lg transition-colors">
                    <Key size={18} /> Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
