import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Volume2, ShieldAlert, Zap } from 'lucide-react';
import { requestAiCoach } from '../services/api';

export default function AiCoPilot({
  stage,
  actionTapped,
  prospectWords,
  companyName,
  prospectName,
  prospectRole
}) {
  const [loading, setLoading] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoachPivot = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestAiCoach({
        stageNumber: stage.stage_number,
        stageName: stage.name,
        actionTapped,
        prospectWords,
        companyName,
        prospectName,
        prospectRole
      });
      if (res.success) {
        setCoachData(res);
      } else {
        setError(res.error || 'Failed to get coaching');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coachData?.pivotSentence) return;
    navigator.clipboard.writeText(coachData.pivotSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakSentence = () => {
    if (!coachData?.pivotSentence || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(coachData.pivotSentence);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="ai-coach-card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'var(--primary)',
            color: '#FFFFFF'
          }}>
            <Sparkles size={14} />
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-cyan)' }}>
            Live AI Coach Pivot
          </span>
          {coachData?.source && (
            <span style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.15rem 0.4rem',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-dim)'
            }}>
              {coachData.source}
            </span>
          )}
        </div>

        <button
          onClick={fetchCoachPivot}
          disabled={loading}
          className="btn-secondary"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            background: 'rgba(0, 41, 255, 0.15)',
            borderColor: 'var(--primary)',
            color: '#FFFFFF'
          }}
          title="Generate or refresh tactical coaching pivot"
        >
          {loading ? (
            <>
              <RefreshCw size={12} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap size={12} color="#38BDF8" />
              <span>{coachData ? 'Re-Coach' : 'Get Live Pivot'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.5rem',
          borderRadius: '4px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#F87171',
          fontSize: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          {error}
        </div>
      )}

      {coachData ? (
        <div>
          <div style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            lineHeight: 1.45,
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            background: 'rgba(0,0,0,0.25)',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            borderLeft: '3px solid var(--accent-cyan)'
          }}>
            “{coachData.pivotSentence}”
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              {coachData.intent && (
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FBBF24',
                  fontWeight: 600
                }}>
                  Intent: {coachData.intent}
                </span>
              )}
              {coachData.coachingTip && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Tip: {coachData.coachingTip}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={speakSentence}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                title="Listen to pronunciation"
              >
                <Volume2 size={13} />
              </button>
              <button
                onClick={handleCopy}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                title="Copy sentence to clipboard"
              >
                {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Tap what happened above or jot prospect words. Click <strong>Get Live Pivot</strong> for an instant 1-sentence pivot tailored for this stage.
        </p>
      )}
    </div>
  );
}
