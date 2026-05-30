import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, Users, Sun, Moon, CheckSquare, BellRing } from 'lucide-react';
import ProductGrid from './components/ProductGrid';
import WhatsAppChat from './components/WhatsAppChat';
import Recommender from './components/Recommender';
import QuoteGenerator from './components/QuoteGenerator';
import LeadDashboard from './components/LeadDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [theme, setTheme] = useState('light');
  const [catalog, setCatalog] = useState([]);
  const [leads, setLeads] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [aiStatus, setAiStatus] = useState({ live: false, message: 'Connecting...' });
  const [toast, setToast] = useState(null);

  // Initialize and fetch data
  useEffect(() => {
    fetchCatalog();
    fetchLeads();
    checkAiConnection();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await fetch('/api/catalog');
      if (response.ok) {
        const data = await response.json();
        setCatalog(data);
      }
    } catch (e) {
      console.error("Failed to fetch catalog:", e);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e);
    }
  };

  const checkAiConnection = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data);
      } else {
        setAiStatus({ live: false, message: 'Server Unreachable' });
      }
    } catch (e) {
      setAiStatus({ live: false, message: 'Offline Mode' });
    }
  };

  // Cart Handlers
  const handleAddToCart = (productId, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, qty: item.qty + qty } 
            : item
        );
      }
      return [...prev, { productId, qty }];
    });
  };

  const handleAddMultipleToCart = (items) => {
    setCartItems(prev => {
      let updated = [...prev];
      items.forEach(newItem => {
        const existingIdx = updated.findIndex(item => item.productId === newItem.productId);
        if (existingIdx > -1) {
          updated[existingIdx].qty = newItem.qty;
        } else {
          updated.push(newItem);
        }
      });
      return updated;
    });
    // Switch tab to let users see the cart items instantly!
    setActiveTab('workspace');
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, qty: newQty } : item
    ));
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // CRM Lead Handlers
  const handleLeadCaptured = (newLead) => {
    // Add to local state list immediately
    setLeads(prev => [newLead, ...prev]);
    
    // Display Toast notification
    setToast({
      title: "New B2B Lead Captured! 🎉",
      message: `${newLead.name} from ${newLead.company} (${newLead.phone})`
    });

    // Auto-hide toast
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleUpdateLeadStatus = (leadId, newStatus) => {
    // Update local state
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  // Theme Switcher
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      {/* Premium Header Nav */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-logo">🧼</span>
          <div className="header-title-container">
            <h1>Ganga Maxx B2B Sales Hub</h1>
            <p>Cleaning Supplies & Housekeeping Wholesaler</p>
          </div>
        </div>

        <div className="header-actions">
          {/* AI Status Badge */}
          <div className={`ai-status-badge ${aiStatus.live ? 'live' : 'simulated'}`} title={aiStatus.message}>
            <span className="status-dot"></span>
            <span>
              {aiStatus.live ? 'AI: Live (Gemini)' : 'AI: Simulated (Demo)'}
            </span>
          </div>

          {/* Theme Toggler */}
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Mode">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspace')}
        >
          <Sparkles size={16} />
          GenAI Sales Workspace
        </button>
        <button 
          className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <ShoppingBag size={16} />
          B2B Product Catalog ({catalog.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <Users size={16} />
          CRM Lead Center ({leads.length})
        </button>
      </nav>

      {/* Main Workspace content */}
      <main className="main-content">
        {activeTab === 'workspace' && (
          <div className="workspace-grid">
            {/* Left Column - WhatsApp Chat Simulator */}
            <div className="glass-panel" style={{ height: 'fit-content' }}>
              <div className="panel-header">
                <h3 className="panel-title">
                  <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
                  AI WhatsApp Sales Assistant
                </h3>
              </div>
              <WhatsAppChat onLeadCaptured={handleLeadCaptured} backendMode={aiStatus.live} />
            </div>

            {/* Right Column - Recommendation Engine & Cart Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Recommender catalog={catalog} onAddMultipleToCart={handleAddMultipleToCart} />
            </div>
            
            {/* Full Width bottom on Workspace grid - Quotation generator */}
            <QuoteGenerator 
              cartItems={cartItems} 
              catalog={catalog}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <ProductGrid catalog={catalog} onAddToCart={handleAddToCart} />
        )}

        {activeTab === 'leads' && (
          <LeadDashboard leads={leads} onUpdateLeadStatus={handleUpdateLeadStatus} />
        )}
      </main>

      {/* CRM Lead Capture Toast Alert */}
      {toast && (
        <div className="toast-notification">
          <BellRing size={20} />
          <div>
            <div style={{ fontWeight: 700 }}>{toast.title}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
