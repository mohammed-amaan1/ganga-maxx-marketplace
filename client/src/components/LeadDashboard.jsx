import React, { useState } from 'react';
import { Users, IndianRupee, MessageSquareCode, Percent, ArrowUpDown, Search, UserCheck } from 'lucide-react';

export default function LeadDashboard({ leads, onUpdateLeadStatus }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate CRM Metrics
  const totalLeads = leads.length;
  
  const getEstValue = (lead) => {
    switch (lead.institution) {
      case 'Hospital': return 25000;
      case 'Hotel': return 18000;
      case 'School': return 12000;
      case 'Apartment': return 15000;
      default: return 8000;
    }
  };

  const potentialRevenue = leads.reduce((sum, lead) => sum + getEstValue(lead), 0);
  const activeEnquiries = leads.filter(l => l.status !== 'Closed').length;
  
  // Sort and filter leads
  const filteredLeads = leads.filter(lead => {
    const text = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(text) ||
      lead.phone.toLowerCase().includes(text) ||
      lead.company.toLowerCase().includes(text) ||
      lead.institution.toLowerCase().includes(text)
    );
  });

  const formatDate = (isoStr) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="crm-container">
      {/* Metrics Row */}
      <div className="crm-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box blue">
            <Users size={20} />
          </div>
          <div className="metric-details">
            <span>Total Leads</span>
            <h4>{totalLeads}</h4>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box green">
            <IndianRupee size={20} />
          </div>
          <div className="metric-details">
            <span>Potential Revenue</span>
            <h4>₹{potentialRevenue.toLocaleString('en-IN')}</h4>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box purple">
            <MessageSquareCode size={20} />
          </div>
          <div className="metric-details">
            <span>Active Enquiries</span>
            <h4>{activeEnquiries}</h4>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box yellow">
            <Percent size={20} />
          </div>
          <div className="metric-details">
            <span>Conversion Target</span>
            <h4>85%</h4>
          </div>
        </div>
      </div>

      {/* CRM Main Panel */}
      <div className="glass-panel">
        <div className="panel-header">
          <h3 className="panel-title">
            <UserCheck size={18} style={{ color: 'var(--primary)' }} />
            Captured CRM Lead Pipeline (Live)
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: '200px' }}
            />
          </div>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Client Contact</th>
                  <th>Company & Sector</th>
                  <th>Captured Requirements</th>
                  <th>Est. Value</th>
                  <th>Timestamp</th>
                  <th>Pipeline Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="lead-empty-state">
                      No leads captured yet. Start a WhatsApp chat conversation on the left, enter an inquiry, and include a contact phone number to see auto-leads populate!
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lead.phone}</div>
                        {lead.email !== 'Not Provided' && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{lead.email}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{lead.company}</div>
                        <span style={{ fontSize: '0.72rem', background: 'var(--background)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {lead.institution}
                        </span>
                      </td>
                      <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.requirements}>
                        {lead.requirements}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{getEstValue(lead).toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(lead.timestamp)}</td>
                      <td>
                        <span className={`status-tag ${lead.status.toLowerCase()}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          <option value="Captured">Captured</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
