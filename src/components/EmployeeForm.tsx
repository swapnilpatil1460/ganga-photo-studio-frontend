import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface EmployeeFormProps {
  employee?: any;
  onClose: () => void;
  onSave: () => void;
}

const roles = ['Owner', 'Manager', 'Editor', 'Printer Operator', 'Photographer', 'Receptionist'];

export default function EmployeeForm({ employee, onClose, onSave }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Photographer',
    status: 'Active',
    salary: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        salary: employee.salary || '',
        photo: employee.photo || ''
      });
    }
  }, [employee]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, photo: compressedBase64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = employee ? `http://localhost:5000/api/employees/${employee._id}` : 'http://localhost:5000/api/employees';
      const method = employee ? 'PUT' : 'POST';
      
      const payload: any = { ...formData };
      if (payload.salary === '') {
        delete payload.salary;
      } else {
        payload.salary = Number(payload.salary);
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSave();
        const data = await res.json();
        if (!employee && data.credentials) {
          setGeneratedCredentials(data.credentials);
        } else {
          onClose();
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to save employee. Please try again.');
      }
    } catch (err: any) {
      console.error('Error saving employee', err);
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCredentials) {
      navigator.clipboard.writeText(`Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (generatedCredentials) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-bold text-green-500">Employee Created Successfully!</h2>
          </div>
          
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <Check size={32} className="text-green-500" />
            </div>
            
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              A system account has been automatically generated for this employee. Please securely share these login credentials with them:
            </p>
            
            <div className="w-full p-4 rounded-lg text-left relative" style={{ backgroundColor: 'var(--theme-bg-alt, rgba(0,0,0,0.2))', border: '1px solid var(--theme-border)' }}>
              <div className="mb-2">
                <span className="text-xs uppercase tracking-wider font-bold block mb-1" style={{ color: 'var(--theme-text-muted)' }}>Email</span>
                <span className="font-mono text-sm" style={{ color: 'var(--theme-text)' }}>{generatedCredentials.email}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold block mb-1" style={{ color: 'var(--theme-text-muted)' }}>Password</span>
                <span className="font-mono text-sm" style={{ color: 'var(--theme-text)' }}>{generatedCredentials.password}</span>
              </div>
              
              <button 
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-md flex items-center gap-1 text-xs transition-colors"
                style={{ backgroundColor: 'var(--theme-bg)', color: copied ? '#22c55e' : 'var(--theme-text-muted)', border: '1px solid var(--theme-border)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--theme-border)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--theme-bg)'}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-alt, rgba(0,0,0,0.2))' }}>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-black text-sm font-semibold rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--accent, #f59e0b)' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{employee ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: 'var(--theme-text-muted)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--theme-border)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden mb-2 relative group cursor-pointer transition-colors" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
              {formData.photo ? (
                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-center px-2" style={{ color: 'var(--theme-text-muted)' }}>Upload<br/>Photo</span>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <label className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Profile Picture (Optional)</label>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Full Name</label>
            <input 
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Email</label>
            <input 
              required type="email"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Phone</label>
            <input 
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Role</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                {roles.map(r => <option key={r} value={r} style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>{r}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Status</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>Active</option>
                <option value="On Leave" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>On Leave</option>
                <option value="Former" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>Former</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Salary / Month (₹)</label>
            <input 
              type="number"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.salary}
              onChange={e => setFormData({...formData, salary: e.target.value})}
            />
          </div>
        </form>
        
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-alt, rgba(0,0,0,0.2))' }}>
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border text-sm font-semibold rounded-lg transition-colors"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--theme-border)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-black text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent, #f59e0b)' }}
          >
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
