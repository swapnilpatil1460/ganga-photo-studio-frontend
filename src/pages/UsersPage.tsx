import { useState, useEffect } from 'react';
import { Trash2, KeyRound, AlertCircle, X, AlertTriangle, Eye, Copy, CheckCircle } from 'lucide-react';

interface UserData {
  _id: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [resetConfirmId, setResetConfirmId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmRevoke = async () => {
    if (!confirmDeleteId) return;
    
    setDeletingId(confirmDeleteId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u._id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmResetPassword = async () => {
    if (!resetConfirmId) return;
    
    setResettingId(resetConfirmId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${resetConfirmId}/password`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch password');
      
      setNewCredentials(data.credentials);
      setResetConfirmId(null);
    } catch (err: any) {
      setError(err.message);
      setResetConfirmId(null);
    } finally {
      setResettingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <KeyRound className="text-yellow-500" size={32} />
            System Access Management
          </h1>
          <p className="text-[var(--theme-text-muted)]">
            View active system users and manage login credentials. Note: Revoking access here only prevents logging in; it does not delete the employee profile.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-black/20 text-[var(--theme-text-muted)] text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">User Email</th>
                <th className="p-4 font-semibold">Password</th>
                <th className="p-4 font-semibold">System Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--theme-text-muted)]">
                    No system users found. (Check database connection)
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{user.email}</div>
                    </td>
                    <td className="p-4 group">
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-sm text-[var(--theme-text-muted)]">********</div>
                        <button 
                          onClick={() => setResetConfirmId(user._id)}
                          title="View Password"
                          className="text-gray-500 hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-all bg-gray-800 p-1.5 rounded-md"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'owner' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(user._id)}
                        disabled={deletingId === user._id || user.role === 'owner'}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          user.role === 'owner' 
                            ? 'opacity-30 cursor-not-allowed text-gray-500 bg-gray-800' 
                            : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        }`}
                        title={user.role === 'owner' ? "Cannot revoke owner access" : "Revoke Login Access"}
                      >
                        <Trash2 size={16} />
                        {deletingId === user._id ? 'Revoking...' : 'Revoke Access'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-800 bg-[#1a1a1a]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle size={20} />
                Confirm Revocation
              </h2>
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 text-[var(--theme-text-muted)] space-y-4">
              <p>Are you sure you want to revoke system access for this user?</p>
              <p className="text-sm bg-red-500/10 text-red-400 p-3 rounded-lg border border-red-500/20">
                <strong>Important:</strong> They will immediately lose all ability to log in. Their employee record will remain intact in the system.
              </p>
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button 
                onClick={confirmRevoke}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center gap-2"
                disabled={!!deletingId}
              >
                {deletingId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Revoking...
                  </>
                ) : (
                  'Yes, Revoke Access'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password Reset Confirmation Modal */}
      {resetConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-800 bg-[#1a1a1a]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
                <KeyRound size={20} />
                View User Password?
              </h2>
              <button onClick={() => setResetConfirmId(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-[var(--theme-text-muted)] space-y-4">
              <p>You are about to view this user's current password securely.</p>
              <p className="text-sm bg-yellow-500/10 text-yellow-500 p-3 rounded-lg border border-yellow-500/20">
                <strong>Note:</strong> Please do not share this password with anyone except the user.
              </p>
            </div>
            <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-end gap-3">
              <button onClick={() => setResetConfirmId(null)} disabled={!!resettingId} className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={confirmResetPassword} disabled={!!resettingId} className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors flex items-center gap-2">
                {resettingId ? 'Decrypting...' : 'Yes, View Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Credentials Modal */}
      {newCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-800 bg-[#1a1a1a]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-green-500">Decrypted Password</h2>
            </div>
            
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              
              <p className="text-sm text-[var(--theme-text-muted)]">
                Here are the user's current login credentials:
              </p>
              
              <div className="w-full p-4 rounded-lg text-left relative bg-black/50 border border-gray-800">
                <div className="mb-2">
                  <span className="text-xs uppercase tracking-wider font-bold block mb-1 text-gray-500">Email</span>
                  <span className="font-mono text-sm text-white">{newCredentials.email}</span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold block mb-1 text-gray-500">Password</span>
                  <span className="font-mono text-sm text-white">{newCredentials.password}</span>
                </div>
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`Email: ${newCredentials.email}\nPassword: ${newCredentials.password}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`absolute top-4 right-4 p-2 rounded-md flex items-center gap-1 text-xs transition-colors border ${copied ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                >
                  {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-end gap-2">
              <button 
                onClick={() => setNewCredentials(null)}
                className="px-4 py-2 text-black text-sm font-semibold rounded-lg bg-yellow-500 hover:bg-yellow-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
