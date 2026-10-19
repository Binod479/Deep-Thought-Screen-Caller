import React, { useState } from 'react';
import { X, PhoneCall, Building2, User, Phone, Briefcase, Sparkles } from 'lucide-react';

const PRESET_PROSPECTS = [
  {
    prospect_name: "Dr. Anjali Menon",
    company_name: "Menon Diagnostics & Clinics",
    prospect_role: "Managing Director & Owner",
    company_kind: "mid-size private company",
    phone_number: "+91 98490 88211"
  },
  {
    prospect_name: "Vikram Singhal",
    company_name: "Annapurna Kitchen Equipment",
    prospect_role: "Director of Operations",
    company_kind: "mid-size private manufacturer",
    phone_number: "+91 98200 44102"
  },
  {
    prospect_name: "Gaurav Agarwal",
    company_name: "Sigma Technologies India",
    prospect_role: "VP & Head, People & Organisation",
    company_kind: "India arm of a multinational",
    phone_number: "+91 98110 33901"
  },
  {
    prospect_name: "Sandeep Rao",
    company_name: "OneWave Digital",
    prospect_role: "Founder & CEO",
    company_kind: "startup",
    phone_number: "+91 97001 55670"
  }
];

export default function NewCallModal({ onClose, onStartCall }) {
  const [callerName, setCallerName] = useState('Arjun (Meridian)');
  const [prospectName, setProspectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [prospectRole, setProspectRole] = useState('Director');
  const [companyKind, setCompanyKind] = useState('mid-size private company');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSelectPreset = (p) => {
    setProspectName(p.prospect_name);
    setCompanyName(p.company_name);
    setProspectRole(p.prospect_role);
    setCompanyKind(p.company_kind);
    setPhoneNumber(p.phone_number);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prospectName.trim() || !companyName.trim()) {
      alert('Please enter prospect name and company name.');
      return;
    }

    onStartCall({
      caller_name: callerName,
      prospect_name: prospectName.trim(),
      company_name: companyName.trim(),
      prospect_role: prospectRole.trim(),
      company_kind: companyKind,
      phone_number: phoneNumber.trim()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Start a New Cold Call</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Open your caller guidance screen beside the phone
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Quick Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--primary)',
              marginBottom: '0.5rem'
            }}>
              Quick Preset Prospects (From Transcripts)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {PRESET_PROSPECTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="btn-secondary"
                  style={{
                    padding: '0.5rem 0.75rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.1rem'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.prospect_name}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>{p.company_name}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                Caller Name
              </label>
              <select
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '6px',
                  padding: '0.625rem 0.875rem',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Arjun (Meridian)">Arjun (Meridian Growth Partners)</option>
                <option value="Priya (Meridian)">Priya (Meridian Growth Partners)</option>
                <option value="Neha (Meridian)">Neha (Meridian Growth Partners)</option>
                <option value="Divya (Meridian)">Divya (Meridian Growth Partners)</option>
                <option value="Sana (Meridian)">Sana (Meridian Growth Partners)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Prospect Name *
                </label>
                <input
                  type="text"
                  required
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  placeholder="e.g. Dr. Anjali Menon"
                  style={{
                    width: '100%',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '6px',
                    padding: '0.625rem 0.875rem',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Prospect Role
                </label>
                <input
                  type="text"
                  value={prospectRole}
                  onChange={(e) => setProspectRole(e.target.value)}
                  placeholder="e.g. Managing Director"
                  style={{
                    width: '100%',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '6px',
                    padding: '0.625rem 0.875rem',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Menon Diagnostics"
                  style={{
                    width: '100%',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '6px',
                    padding: '0.625rem 0.875rem',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Company Kind
                </label>
                <select
                  value={companyKind}
                  onChange={(e) => setCompanyKind(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '6px',
                    padding: '0.625rem 0.875rem',
                    color: 'var(--text-main)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <option value="mid-size private company">mid-size private company</option>
                  <option value="mid-size private manufacturer">mid-size private manufacturer</option>
                  <option value="India arm of a multinational">India arm of a multinational</option>
                  <option value="startup">startup</option>
                  <option value="large private company">large private company</option>
                  <option value="listed Indian company">listed Indian company</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 98490 12345"
                style={{
                  width: '100%',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '6px',
                  padding: '0.625rem 0.875rem',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <PhoneCall size={16} />
                <span>Launch Screen on Call</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
