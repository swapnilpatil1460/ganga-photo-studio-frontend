import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Check } from 'lucide-react';
import type { Customer } from './Customers';

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    status: 'ACTIVE'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData(data);
          } else {
            setError('Failed to load customer details.');
          }
        } catch (err) {
          setError('Network error loading customer.');
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (!formData.name || !formData.phone) {
      setError('Name and Phone are required.');
      setLoading(false);
      return;
    }
    
    if (!/^\d{10,}$/.test(formData.phone)) {
      setError('Please enter a valid phone number (at least 10 digits).');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${id}` : (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        setError(data.message || 'Error saving customer.');
      }
    } catch (err) {
      setError('Network error saving customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button className="text-gray-600 hover:text-gray-900 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="page-title mb-1">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
          <p className="text-gray-600 text-sm">Enter the customer details below.</p>
        </div>
      </div>

      <div className="form-card">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-section">
            <h3 className="form-section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Customer Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Enter full name"
                  className="search-input"
                />
              </div>
              <div className="form-group flex-1">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="e.g. 9876543210"
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="name@example.com"
                  className="search-input"
                />
              </div>
              <div className="form-group flex-1">
                <label>Status</label>
                <select 
                  className="search-input appearance-none cursor-pointer"
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                value={formData.address || ''} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                placeholder="Full address"
                className="search-input"
              />
            </div>
          </div>

          <div className="form-section border-t border-gray-200 pt-6">
            <h3 className="form-section-title">Additional Details</h3>
            <div className="form-group">
              <label>Notes</label>
              <textarea 
                className="search-input min-h-[100px] resize-y"
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                placeholder="Any special requirements or notes about this customer..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-200">
            <button type="button" className="btn-outline flex items-center gap-2" onClick={() => navigate(-1)}>
              <X size={18} /> Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-800 bg-[#1a1a1a]">
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <Check size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? 'Customer Updated!' : 'Customer Created!'}
              </h2>
              <p className="text-sm text-[var(--theme-text-muted)]">
                The customer details have been successfully saved to the system.
              </p>
            </div>
            <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-center">
              <button 
                onClick={() => navigate('/dashboard/customers')}
                className="w-full px-4 py-2 text-sm font-bold rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerForm;
