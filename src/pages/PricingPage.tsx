import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Loader, AlertCircle } from 'lucide-react';
import ServiceForm from '../components/ServiceForm';

const PricingPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  const role = localStorage.getItem('role');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
        setError(null);
      } else {
        setError('Failed to fetch services.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        fetchServices();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete service.');
      }
    } catch (err) {
      alert('Error deleting service.');
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <DollarSign className="text-yellow-500" size={32} />
            Pricing Configuration
          </h1>
          <p className="text-[var(--theme-text-muted)] mt-1">
            Manage global service rates and pricing structure.
          </p>
        </div>
        
        {role === 'owner' && (
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add New Service
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Base Price (₹)</th>
              <th>Description</th>
              {role === 'owner' && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={role === 'owner' ? 4 : 3} className="text-center p-8">
                  <Loader className="animate-spin text-yellow-500 mx-auto" size={32} />
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={role === 'owner' ? 4 : 3} className="text-center p-12 text-[var(--theme-text-muted)]">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-[var(--theme-text)] mb-1">No services configured</p>
                  <p className="text-sm">Click "Add New Service" to start building your pricing structure.</p>
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service._id}>
                  <td>
                    <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{service.name}</span>
                  </td>
                  <td>
                    <span className="font-bold text-green-500">₹{service.basePrice?.toLocaleString()}</span>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                      {service.description || <span className="opacity-50 italic">No description</span>}
                    </span>
                  </td>
                  {role === 'owner' && (
                    <td>
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleEdit(service)}
                          className="text-[var(--theme-text-muted)] hover:text-yellow-500 transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(service._id)}
                          className="text-[var(--theme-text-muted)] hover:text-red-500 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <ServiceForm 
          service={editingService} 
          onClose={() => setIsFormOpen(false)} 
          onSave={fetchServices} 
        />
      )}
    </div>
  );
};

export default PricingPage;
