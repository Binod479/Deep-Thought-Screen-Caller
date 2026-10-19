import React from 'react';
import { X, Calendar, Clock, CheckCircle, ArrowRight, Building, User, Phone, Sparkles } from 'lucide-react';

export default function CallDetailModal({ call, onClose }) {
  if (!call) return null;

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const getOutcomeBadgeClass = (outcome) => {
    if (['next_step_agreed', 'agreed_to_receive_report', 'interested'].includes(outcome)) return 'badge-agreed';
    if (['follow_up', 'call_again'].includes(outcome)) return 'badge-followup';
    if (['not_interested', 'do_not_call'].includes(outcome)) return 'badge-not-interested';
    if (['wrong_person', 'moved_company'].includes(outcome)) return 'badge-wrong-person';
    return 'badge-neutral';
  };

  const stagesList = call.stages || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className={`badge-outcome ${getOutcomeBadgeClass(call.outcome)}`}>
                {call.outcome?.replace(/_/g, ' ')}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--primary)',
                fontWeight: 700
              }}>
                Reached Stage {call.max_stage_reached || call.current_stage || 1}
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900 }}>
              {call.prospect_name}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {call.prospect_role} · {call.company_name} ({call.company_kind})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            background: 'var(--bg-dark)',
            padding: '0.875rem',
            borderRadius: '6px',
            border: '1px solid var(--surface-border)'
          }}>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Duration</p>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {formatDuration(call.duration_seconds || 0)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Caller</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {call.caller_name || 'Meridian Caller'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Date & Time</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {call.created_at ? new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
              </p>
            </div>
          </div>

          {/* AI Debrief / Summary */}
          {call.ai_summary && (
            <div style={{
              background: 'rgba(0, 41, 255, 0.08)',
              border: '1px solid rgba(0, 41, 255, 0.25)',
              borderRadius: '6px',
              padding: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <Sparkles size={14} color="#38BDF8" />
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                  AI CRM Debrief
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                {call.ai_summary}
              </p>
            </div>
          )}

          {/* Caller Note */}
          {call.notes && (
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                Follow-up Notes
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {call.notes}
              </p>
            </div>
          )}

          {/* Stage Progression Timeline */}
          <div>
            <p style={{
              fontSize: '0.6875rem',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              marginBottom: '0.75rem',
              letterSpacing: '0.1em'
            }}>
              Stage Logged Progression ({stagesList.length} Stages)
            </p>

            {stagesList.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No individual stage taps logged for this call.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {stagesList.map((stg, idx) => (
                  <div
                    key={stg.id || idx}
                    style={{
                      borderLeft: `2px solid ${stg.stage_number === 5 ? 'var(--accent-amber)' : 'var(--primary)'}`,
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0 6px 6px 0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        Stage {stg.stage_number}: {stg.stage_name}
                      </span>
                      {stg.action_label && (
                        <span style={{
                          fontSize: '0.6875rem',
                          background: 'rgba(255,255,255,0.08)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          color: 'var(--text-muted)'
                        }}>
                          Tapped: {stg.action_label}
                        </span>
                      )}
                    </div>

                    {stg.prospect_words && (
                      <p style={{
                        fontSize: '0.8125rem',
                        color: stg.stage_number === 5 ? '#FDE68A' : 'var(--text-main)',
                        fontStyle: 'italic',
                        marginTop: '0.25rem'
                      }}>
                        "{stg.prospect_words}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--surface-border)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
