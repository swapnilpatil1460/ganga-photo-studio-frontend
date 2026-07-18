import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface Order {
  _id: string;
  orderId: string;
  service: string;
  quantity: number;
  price: number;
  totalAmount: number;
  createdAt: string;
  status: string;
  paidAmount?: number;
  customer?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    customerId: string;
  };
}

const InvoicePage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Load studio profile
  const savedProfile = localStorage.getItem('studioProfile');
  const studioProfile = savedProfile ? JSON.parse(savedProfile) : {
    name: 'Dhanaraj Chougale Photo & Film',
    address: '1, SHRI MOUNI VIDYAPEETH RD,\nGARGOTI, MAHARASHTRA 416209, INDIA',
    phone: '+91 98609 20571',
    gstId: 'GSTN-27ARIPK2620F1Z2 (OPTIONAL)',
    email: 'contact@gangastudio.com'
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Mock data handling for customer if not populated
          if (!data.customer || typeof data.customer === 'string') {
            const cRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${data.customer}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (cRes.ok) {
              data.customer = await cRes.json();
            } else {
              // Fallback if customer is not found
              data.customer = {
                name: 'Unknown Customer',
                phone: 'N/A',
                address: 'N/A',
                email: 'N/A'
              };
            }
          }
          setOrder(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      const originalTitle = document.title;
      const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const customerName = order.customer?.name ? order.customer.name.replace(/\s+/g, '_') : 'Customer';
      document.title = `${customerName}_${dateStr}`;
      
      return () => {
        document.title = originalTitle;
      };
    }
  }, [order]);

  if (loading) return <div className="p-8 text-gray-400 text-center">Loading Invoice...</div>;
  if (!order) return <div className="p-8 text-red-500 text-center">Order not found.</div>;

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const customerName = order.customer?.name ? order.customer.name.replace(/\s+/g, '_') : 'Customer';
    const filename = `${customerName}_${dateStr}.pdf`;

    const opt = {
      margin:       0.5,
      filename:     filename,
      image:        { type: 'jpeg' as 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="page-container p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Non-Printable Header */}
      <div className="flex justify-between items-center mb-8 no-print max-w-4xl mx-auto">
        <button className="btn-outline flex items-center gap-2 bg-white px-4 py-2 rounded shadow-sm border border-gray-200 text-sm font-semibold" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-4">
          <button className="btn-outline flex items-center gap-2 bg-white px-4 py-2 rounded shadow-sm border border-gray-200 text-sm font-semibold transition-colors hover:bg-gray-50" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm text-sm font-semibold transition-colors" onClick={handleDownloadPDF}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div id="invoice-content" className="invoice-preview-container max-w-4xl mx-auto bg-white" style={{ minHeight: '1056px' }}>
        <div 
          id="print-section"
        style={{
          width: '100%',
          maxWidth: '210mm',
          minHeight: '280mm',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: '#ffffff',
          color: '#333333',
          fontFamily: 'Arial, sans-serif',
          border: '2px solid #475569',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
        {/* Header section */}
        <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                  <span className="invoice-logo-cursive" style={{ color: '#000000', margin: 0, padding: 0 }}>Ganga</span>
                  <span className="invoice-logo-serif" style={{ color: '#000000', margin: 0, padding: 0 }}>Photo</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '2px' }}>{studioProfile.name}</div>
                <div style={{ fontSize: '14px', color: '#4b5563' }}>Turning emotions into everlasting frames</div>
              </td>
              
              {/* Address / Right */}
              <td style={{ verticalAlign: 'top', textAlign: 'right', padding: 0, fontSize: '14px', lineHeight: '1.5' }}>
                <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '4px', fontSize: '15px' }}>{studioProfile.gstId}</div>
                <div style={{ color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px', whiteSpace: 'pre-line' }}>{studioProfile.address}</div>
                <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '15px' }}>CONTACT: {studioProfile.phone}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bill To & Dates Box */}
        <table style={{ width: '100%', border: '1px solid #d1d5db', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', borderRight: '1px solid #d1d5db', padding: '12px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: '#000' }}>Bill to:</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>Name: <span style={{ fontWeight: 'bold' }}>{order.customer?.name || 'Unknown'}</span></div>
                <div style={{ marginBottom: '4px', color: '#374151' }}>Address: {order.customer?.address || 'N/A'}</div>
                <div style={{ marginBottom: '4px', color: '#374151' }}>Contact: {order.customer?.phone || 'N/A'}</div>
                <div style={{ color: '#374151' }}>GST Number: -</div>
              </td>
              <td style={{ width: '50%', padding: '12px', verticalAlign: 'top' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: '#000', width: '100px', paddingBottom: '4px' }}>Billing date:</td>
                      <td style={{ color: '#374151', paddingBottom: '4px' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: '#000', width: '100px' }}>Invoice No:</td>
                      <td style={{ color: '#374151' }}>#{order.orderId}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table style={{ width: '100%', border: '1px solid #d1d5db', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', color: '#000', textAlign: 'center', width: '60px' }}>Item#</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', color: '#000', textAlign: 'left' }}>Service Description</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', color: '#000', textAlign: 'center', width: '60px' }}>Qty</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', color: '#000', textAlign: 'center', width: '100px' }}>Unit Price</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d1d5db', fontWeight: 'bold', color: '#000', textAlign: 'center', width: '100px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>1</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', color: '#000' }}>{order.service}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>{order.quantity}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>{order.price}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>{order.quantity * order.price}</td>
            </tr>
            
            {/* Empty padding row */}
            <tr>
              <td style={{ padding: '24px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}></td>
              <td style={{ padding: '24px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}></td>
              <td style={{ padding: '24px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}></td>
              <td style={{ padding: '24px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}></td>
              <td style={{ padding: '24px 8px', borderBottom: '1px solid #d1d5db' }}></td>
            </tr>
            
            <tr>
              <td colSpan={4} style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'right', color: '#000' }}>Invoice Subtotal:</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>{order.totalAmount}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'right', color: '#000' }}>CGST(9%):</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>0</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'right', color: '#000' }}>SGST(9%):</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#000' }}>0</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'right', color: '#000', fontSize: '14px' }}>PAID AMOUNT:</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'center', color: '#16a34a', fontSize: '14px' }}>{order.paidAmount || 0}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'right', color: '#000', fontSize: '15px' }}>REMAINING AMOUNT:</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'center', color: '#e11d48', fontSize: '15px' }}>{order.totalAmount - (order.paidAmount || 0)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={4} style={{ padding: '10px 8px', borderRight: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'right', color: '#000', fontSize: '15px' }}>GRAND TOTAL:</td>
              <td style={{ padding: '10px 8px', fontWeight: 'bold', textAlign: 'center', color: '#000', fontSize: '15px' }}>{order.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Spacer */}
        <div style={{ height: '32px' }}></div>

        {/* Signature Box */}
        <table style={{ width: '100%', marginBottom: '2rem' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%' }}></td>
              <td style={{ width: '40%', textAlign: 'center', fontSize: '14px', color: '#000' }}>
                <div style={{ marginBottom: '40px', fontWeight: 'bold' }}>For Ganga Photo Studio</div>
                <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto 4px auto' }}></div>
                <div style={{ fontWeight: 'bold' }}>Authorized Signature</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Disclaimer */}
        <div style={{ fontSize: '11px', lineHeight: '1.2', color: '#000', borderTop: '1px solid #d1d5db', paddingTop: '8px', marginTop: '32px', paddingBottom: '16px' }}>
          <span style={{ fontWeight: 'bold' }}>Subject To Pune Jurisdiction. </span>
          <span style={{ fontStyle: 'italic' }}>
            I/We hereby certify that my/our registration certificate under the Maharashtra Value Added Tax Act 2002 is in force on the date which the sale of goods specified in the tax invoice is made by me/us and that the transaction of sale covered by this Bill/Cash has been effect by me/us and it shall be accounted for in the turnover of sales while filing of return and the due tax if any payable of the sale has been paid or shall be paid.
          </span>
        </div>

        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
