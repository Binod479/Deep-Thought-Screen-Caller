import React, { useState } from 'react';
import { X, Check, Sparkles, PhoneOff, Calendar, AlertTriangle } from 'lucide-react';
import { requestAiSummary } from '../services/api';

const OUTCOME_OPTIONS = [
  { id: 'next_step_agreed', label: 'Next Step Agreed', desc: 'Fixed meeting, set time callback, or working session agreed' },
  { id: 'agreed_to_receive_report', label: 'Agreed to Receive Report', desc: 'Consent given to send growth report on WhatsApp/Email' },
  { id: 'interested', label: 'Interested', desc: 'Positive sentiment expressed without a locked date' },
  { id: 'follow_up', label: 'Follow Up Later', desc: 'Prospect asked to call back due to meeting/driving' },
  { id: 'call_again', label: 'Call Again', desc: 'Line drop, audio issues, or poor connectivity' },
  { id: 'not_interested', label: 'Not Interested', desc: 'Declined report or stated no requirement' },
  { id: 'do_not_call', label: 'Do Not Call', desc: 'Explicitly requested removal from caller list' },
  { id: 'wrong_person', label: 'Wrong Person', desc: 'Wrong desk / referred to another executive' },
  { id: 'moved_company', label: 'Moved Company', desc: 'Person no longer works at the organization' }
];

export default function CallCloseModal({
  call,
  stages = [],
  currentStageNumber,
  durationSeconds,
  onClose,
  onSaveAndExit
}) {
  const [outcome, setOutcome] = useState('next_step_agreed');
  const [notes, setNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiSentiment, setAiSentiment] = useState('Evaluating');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerateSummary = async () => {
    setGeneratingAi(true);
    try {
      const res = await requestAiSummary({
        call: {
          ...call,
          duration_seconds: durationSeconds,
          outcome,
          max_stage_reached: currentStageNumber
        },
        stages
      });
      if (res.success) {
        setAiSummary(res.summary + (res.nextAction ? ` Next Action: ${res.nextAction}` : ''));
        if (res.sentiment) setAiSentiment(res.sentiment);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSaveAndExit({
      outcome,
      notes,
      ai_summary: aiSummary,
      ai_sentiment: aiSentiment,
      duration_seconds: durationSeconds,
      max_stage_reached: currentStageNumber
    });
    setSaving(false);
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Close Call & Log Outcome</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {call.prospect_name} · {call.company_name} ({formatDuration(durationSeconds)})
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
          {/* Stage reached warning if ended early */}
          {currentStageNumber < 8 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#FBBF24',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={16} />
              <span>Call ended at <strong>Stage {currentStageNumber}</strong>. Most cold calls end before Stage 8.</span>
            </div>
          )}

          {/* Outcome Grid */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-dim)',
              marginBottom: '0.5rem'
            }}>
              Call Outcome (Select One)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {OUTCOME_OPTIONS.map((opt) => {
                const isSelected = outcome === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setOutcome(opt.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--surface-border)'}`,
                      background: isSelected ? 'var(--primary)' : 'var(--surface-dark)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '0.6875rem', opacity: 0.8, fontWeight: 400 }}>
                      {opt.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Summary Generator */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--accent-cyan)'
              }}>
                AI Call Debrief & Next Action
              </label>

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generatingAi}
                className="btn-secondary"
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  background: 'rgba(6, 182, 212, 0.1)',
                  borderColor: 'var(--accent-cyan)',
                  color: 'var(--accent-cyan)'
                }}
              >
                <Sparkles size={12} />
                <span>{generatingAi ? 'Generating...' : 'Auto-Generate'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              placeholder="Click 'Auto-Generate' or type CRM debrief notes..."
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--surface-border)',
                borderRadius: '6px',
                padding: '0.625rem 0.875rem',
                color: 'var(--text-main)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-sans)',
                resize: 'none'
              }}
            />
          </div>

          {/* Caller Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-dim)',
              marginBottom: '0.4rem'
            }}>
              Follow-up Notes / Callback Details
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call Thursday 4pm / Sent WhatsApp one-pager"
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

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              <Check size={16} />
              <span>{saving ? 'Saving...' : 'Save Call & View History'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
