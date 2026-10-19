import React, { useState, useEffect } from 'react';
import { X, Check, Server, Key, Sparkles, Activity, ExternalLink, ShieldCheck } from 'lucide-react';
import { getBackendUrl, setBackendUrl, getCustomApiKey, setCustomApiKey, getLlmProvider, setLlmProvider, checkBackendHealth } from '../services/api';

export default function SettingsModal({ onClose }) {
  const [backendUrl, setLocalBackendUrl] = useState('');
  const [apiKey, setLocalApiKey] = useState('');
  const [provider, setLocalProvider] = useState('auto');
  const [healthStatus, setHealthStatus] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setLocalBackendUrl(getBackendUrl());
    setLocalApiKey(getCustomApiKey());
    setLocalProvider(getLlmProvider());
  }, []);

  const handleTestHealth = async () => {
    setPinging(true);
    setHealthStatus(null);
    try {
      const start = Date.now();
      const res = await checkBackendHealth();
      const latency = Date.now() - start;
      setHealthStatus({ ok: true, data: res, latency });
    } catch (e) {
      setHealthStatus({ ok: false, error: e.message });
    } finally {
      setPinging(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setBackendUrl(backendUrl);
    setCustomApiKey(apiKey);
    setLlmProvider(provider);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Connection & LLM Settings</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Configure Render Backend URL & Free Tier LLM
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
          {/* Backend URL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                Render Backend Base URL
              </label>
              <button
                type="button"
                onClick={handleTestHealth}
                disabled={pinging}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Activity size={13} />
                <span>{pinging ? 'Testing...' : 'Test Health Endpoint'}</span>
              </button>
            </div>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setLocalBackendUrl(e.target.value)}
              placeholder="e.g. https://meridian-caller.onrender.com (or leave empty for relative /)"
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--surface-border)',
                borderRadius: '6px',
                padding: '0.625rem 0.875rem',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              On Render free tier, service wakes up on request. Leave empty to use relative /api proxy.
            </p>

            {healthStatus && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                background: healthStatus.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${healthStatus.ok ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                color: healthStatus.ok ? '#34D399' : '#F87171'
              }}>
                {healthStatus.ok ? (
                  <div>
                    <strong>✓ Health check passed ({healthStatus.latency}ms):</strong> {healthStatus.data.service} · {healthStatus.data.llmProvider}
                  </div>
                ) : (
                  <div>
                    <strong>✗ Health check failed:</strong> {healthStatus.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LLM Provider Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
              LLM Provider (Free Tier Supported)
            </label>
            <select
              value={provider}
              onChange={(e) => setLocalProvider(e.target.value)}
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
              <option value="auto">Auto / Backend Configured (Gemini / Groq / Heuristic)</option>
              <option value="gemini">Google Gemini 2.0 Flash (Free AI Studio Key)</option>
              <option value="groq">Groq LLaMA 3.3 70B (Free Instant Sub-second Key)</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
              Custom LLM API Key (Optional Override)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Paste Gemini or Groq API key (saved locally in browser)"
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--surface-border)',
                borderRadius: '6px',
                padding: '0.625rem 0.875rem',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              If left blank, the backend's environment key (or transcript heuristic engine) is used automatically.
            </p>
          </div>

          {/* Supabase Free Tier Information */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--surface-border)',
            borderRadius: '6px',
            padding: '0.75rem'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              Supabase Free Tier Integration
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Schema is provided in <code style={{ color: 'var(--accent-cyan)' }}>supabase/schema.sql</code>. Connect via <code>SUPABASE_URL</code> and <code>SUPABASE_KEY</code> on Render. Zero-setup in-memory fallback runs automatically if unconfigured.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{savedNotice ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
