import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 font-sans" style={{ background: '#0a1011', color: '#ffffff' }}>
      
      {/* Header / Logo Section */}
      <div className="text-center mb-8">
        <div className="mx-auto w-28 h-28 rounded-full border-2 flex items-center justify-center mb-4 overflow-hidden bg-white" style={{ borderColor: '#c9a15a' }}>
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl tracking-[0.2em] mb-2" style={{ fontFamily: "Georgia, serif" }}>GANGA PHOTO</h1>
        <p className="text-xs tracking-[0.2em]" style={{ color: '#c9a15a' }}>STUDIO ADMIN</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[400px] p-6 rounded-2xl border" style={{ background: '#121c1e', borderColor: '#1f2b2d' }}>
        

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
              Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-colors border text-sm"
              style={{ background: '#0a1011', borderColor: '#1f2b2d', color: '#ffffff' }}
              placeholder="studio@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-colors border text-sm tracking-widest placeholder:tracking-normal"
              style={{ background: '#0a1011', borderColor: '#1f2b2d', color: '#ffffff' }}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-sm font-semibold transition-transform hover:scale-[1.02] mt-8"
            style={{ background: '#d5b274', color: '#000' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
