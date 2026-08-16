import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ServiceFormProps {
  service?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function ServiceForm({ service, onClose, onSave }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        basePrice: service.basePrice !== undefined ? service.basePrice.toString() : '',
        description: service.description || ''
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const url = service 
        ? `${import.meta.env.VITE_API_URL || ''}/api/services/${service._id}` 
        : `${import.meta.env.VITE_API_URL || ''}/api/services`;
      
      const method = service ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name.trim(),
        basePrice: Number(formData.basePrice),
        description: formData.description.trim()
      };

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
        onClose();
      } else {
        const data = await res.json().catch(() => ({ message: `Server error: HTTP ${res.status}` }));
        setError(data.message || `Failed to save service. HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.error('Error saving service', err);
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{service ? 'Edit Service Price' : 'Add New Service'}</h2>
          <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: 'var(--theme-text-muted)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--theme-border)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Service Name *</label>
            <input 
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., 4x6 Digital Board Making"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Base Price (₹) *</label>
            <input 
              required
              type="number"
              min="0"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.basePrice}
              onChange={e => setFormData({...formData, basePrice: e.target.value})}
              placeholder="700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Description (Optional)</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Details about this service..."
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
            {loading ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  );
}
