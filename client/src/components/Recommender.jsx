import React, { useState } from 'react';
import { Sparkles, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function Recommender({ catalog, onAddMultipleToCart }) {
  const [institution, setInstitution] = useState('Hotel');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const institutionTypes = ['Hotel', 'Hospital', 'School', 'Office', 'Apartment', 'Restaurant'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setAddedSuccess(false);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionType: institution,
          requirements: requirements || `Standard hygiene setup for a B2B ${institution}`
        })
      });

      if (response.ok) {
        const resData = await response.json();
        setResults(resData.data);
      } else {
        throw new Error("API call failed");
      }
    } catch (error) {
      console.error("Recommender error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!results || !results.recommendations) return;
    
    const itemsToAdd = results.recommendations.map(rec => ({
      productId: rec.productId,
      qty: rec.qty
    }));
    
    onAddMultipleToCart(itemsToAdd);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  // Find product name and details for display
  const getProductDetails = (id) => {
    return catalog.find(item => item.id === id) || { name: id, category: 'N/A' };
  };

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          AI Product Recommendation Assistant
        </h3>
      </div>

      <div className="panel-body">
        <form onSubmit={handleSubmit} className="recommender-form">
          <div className="form-group">
            <label htmlFor="inst-type">Select Institution Type</label>
            <select
              id="inst-type"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            >
              {institutionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="req-text">Describe Requirements (Area size, floors, special needs)</label>
            <textarea
              id="req-text"
              rows={3}
              placeholder="e.g. 50-room boutique hotel, granite floors, glass lobby, needing washroom chemicals and microfiber cloths..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="typing-indicator" style={{ display: 'inline-flex', padding: 0 }}>
                <span className="typing-dot" style={{ backgroundColor: 'white' }}></span>
                <span className="typing-dot" style={{ backgroundColor: 'white' }}></span>
                <span className="typing-dot" style={{ backgroundColor: 'white' }}></span>
              </span>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Recommendation Plan
              </>
            )}
          </button>
        </form>

        {results && (
          <div className="rec-results">
            <div className="rec-summary">
              {results.summary}
            </div>

            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Recommended Package:</h4>
            <div className="rec-list">
              {results.recommendations.map((rec, index) => {
                const prod = getProductDetails(rec.productId);
                return (
                  <div key={index} className="rec-card">
                    <div className="rec-card-info">
                      <span className="prod-category" style={{ fontSize: '0.65rem' }}>{prod.category}</span>
                      <h5>{prod.name}</h5>
                      <p>*{rec.reason}*</p>
                    </div>
                    <span className="rec-badge-qty">Qty {rec.qty}</span>
                  </div>
                );
              })}
            </div>

            <div className="rec-actions">
              <button 
                className="add-all-btn" 
                onClick={handleAddAllToCart}
                style={{ backgroundColor: addedSuccess ? 'var(--success)' : 'var(--secondary)' }}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    Added Successfully!
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Add Package to Quotation Cart
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
