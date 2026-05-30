import React, { useState } from 'react';
import { Clipboard, Download, RefreshCw, FileText, Trash2, Minus, Plus } from 'lucide-react';

export default function QuoteGenerator({ cartItems, catalog, onUpdateCartQty, onRemoveFromCart, onClearCart }) {
  const [clientName, setClientName] = useState('');
  const [institution, setInstitution] = useState('Hotel');
  const [loading, setLoading] = useState(false);
  const [quotationText, setQuotationText] = useState('');
  const [copied, setCopied] = useState(false);

  const institutionTypes = ['Hotel', 'Hospital', 'School', 'Office', 'Apartment', 'Restaurant'];

  const getProductDetails = (id) => {
    return catalog.find(item => item.id === id) || { name: id, price: 0, unitSize: 'unit' };
  };

  const handleGenerateQuote = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setQuotationText('');

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: cartItems,
          clientName: clientName || "Valued B2B Customer",
          institutionType: institution
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuotationText(data.text);
      } else {
        throw new Error("Failed to generate quote");
      }
    } catch (error) {
      console.error("Quotation generator error:", error);
      setQuotationText("⚠️ Connectivity issue generating quotation. Please verify your internet connection or backend server status.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!quotationText) return;
    navigator.clipboard.writeText(quotationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadTxt = () => {
    if (!quotationText) return;
    const blob = new Blob([quotationText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ganga_Maxx_Quotation_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          AI Quotation Generator Workspace
        </h3>
        {cartItems.length > 0 && (
          <button className="delete-cart-btn" onClick={onClearCart} title="Clear Cart" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
            <Trash2 size={14} /> Clear Cart
          </button>
        )}
      </div>

      <div className="panel-body">
        <div className="quote-workspace">
          {/* Cart controls on Left */}
          <div className="quote-cart-panel">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>1. Configure Quote Cart</h4>
            
            <div className="cart-items-list">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  Your B2B Cart is empty.<br/>Add items from the Product Catalog or use the AI Recommendation Assistant!
                </div>
              ) : (
                cartItems.map(item => {
                  const details = getProductDetails(item.productId);
                  return (
                    <div key={item.productId} className="cart-item-row">
                      <div className="cart-item-details">
                        <h6>{details.name}</h6>
                        <span>₹{details.price} per {details.unitSize}</span>
                      </div>
                      
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => onUpdateCartQty(item.productId, item.qty - 1)}>
                          <Minus size={12} />
                        </button>
                        <span className="cart-qty-input">{item.qty}</span>
                        <button className="qty-btn" onClick={() => onUpdateCartQty(item.productId, item.qty + 1)}>
                          <Plus size={12} />
                        </button>
                        <button className="delete-cart-btn" onClick={() => onRemoveFromCart(item.productId)} style={{ marginLeft: '8px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Business / Client Name</label>
              <input
                type="text"
                placeholder="e.g. Radisson Blu Hotel / Apollo Hospital"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Client Sector</label>
              <select value={institution} onChange={(e) => setInstitution(e.target.value)}>
                {institutionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <button
              className="submit-btn"
              onClick={handleGenerateQuote}
              disabled={cartItems.length === 0 || loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="status-dot" style={{ animation: 'spin 1.5s infinite linear' }} />
                  Composing AI quotation...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Professional Quote
                </>
              )}
            </button>
          </div>

          {/* Quotation Document preview on Right */}
          <div className="quote-preview-panel">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>2. AI Generated Quotation Preview</h4>
            
            {quotationText ? (
              <>
                <div className="quote-document">
                  {quotationText}
                </div>
                <div className="quote-actions-tray">
                  <button className="quote-action-btn secondary" onClick={handleCopyToClipboard}>
                    <Clipboard size={14} />
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button className="quote-action-btn primary" onClick={handleDownloadTxt}>
                    <Download size={14} />
                    Download Invoice Text
                  </button>
                </div>
              </>
            ) : (
              <div 
                className="cart-empty" 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  background: 'var(--background)'
                }}
              >
                <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                <span>Configure your cart and click "Generate Professional Quote" to view the proforma invoice sheet here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
