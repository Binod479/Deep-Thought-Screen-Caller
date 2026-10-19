import React, { useState, useEffect } from 'react';
import { ArrowRight, PhoneOff, Mic, MicOff, MessageSquareQuote, CheckCircle2, ChevronLeft } from 'lucide-react';
import AiCoPilot from './AiCoPilot';

export default function StageCard({
  stage,
  call,
  currentStageNumber,
  totalStages = 8,
  nextStageName,
  onSaveStageAndNext,
  onPrevStage,
  onEndCall,
  savedStageData = null
}) {
  const [selectedTap, setSelectedTap] = useState(savedStageData?.action_tapped || '');
  const [selectedLabel, setSelectedLabel] = useState(savedStageData?.action_label || '');
  const [prospectWords, setProspectWords] = useState(savedStageData?.prospect_words || '');
  const [isRecording, setIsRecording] = useState(false);

  // Sync state when stage changes
  useEffect(() => {
    setSelectedTap(savedStageData?.action_tapped || '');
    setSelectedLabel(savedStageData?.action_label || '');
    setProspectWords(savedStageData?.prospect_words || '');
  }, [stage?.stage_number, savedStageData]);

  const handleTapClick = (tap) => {
    setSelectedTap(tap.id);
    setSelectedLabel(tap.label);
  };

  const handleNext = () => {
    onSaveStageAndNext({
      stage_number: stage.stage_number,
      stage_name: stage.name,
      action_tapped: selectedTap,
      action_label: selectedLabel || selectedTap,
      prospect_words: prospectWords
    });
  };

  // Browser speech recognition for hands-free verbatim logging
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type directly in the box.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English tailored for transcripts

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setProspectWords(prev => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  if (!stage) return null;

  const isStage5 = stage.stage_number === 5;

  return (
    <div style={{
      background: 'var(--surface-dark)',
      border: '1px solid var(--surface-border)',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-card)',
      position: 'relative'
    }}>
      {/* Stage Number & Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--primary)'
        }}>
          Stage {stage.stage_number} of {totalStages}
        </p>

        {savedStageData && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-emerald)',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px'
          }}>
            <CheckCircle2 size={12} /> Logged
          </span>
        )}
      </div>

      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        marginBottom: '0.5rem',
        color: 'var(--text-main)'
      }}>
        {stage.name}
      </h2>

      {/* What it is for (One glanceable line) */}
      <div style={{
        background: 'rgba(0, 41, 255, 0.06)',
        borderLeft: '3px solid var(--primary)',
        padding: '0.625rem 0.875rem',
        borderRadius: '0 4px 4px 0',
        marginBottom: '1.25rem'
      }}>
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-dim)',
          marginBottom: '0.2rem'
        }}>
          What it is for
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
          {stage.what_it_is_for}
        </p>
      </div>

      {/* They may say (From the 100 transcripts) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--text-dim)',
          marginBottom: '0.5rem'
        }}>
          Prospects tend to say at this point
        </p>
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {stage.prospect_says?.map((quote, idx) => (
            <div
              key={idx}
              onClick={() => {
                const cleaned = quote.replace(/^"|"$/g, '');
                setProspectWords(cleaned);
              }}
              title="Click to copy into prospect's words"
              style={{
                borderLeft: '2px solid var(--primary)',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
                borderRadius: '0 4px 4px 0',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 41, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 800, marginRight: '0.4rem' }}>›</span>
              {quote}
            </div>
          ))}
        </div>
      </div>

      {/* What happened (Tactile tap buttons) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--text-dim)',
          marginBottom: '0.5rem'
        }}>
          What happened (Tap one)
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.5rem'
        }}>
          {stage.quick_taps?.map((tap) => {
            const isSelected = selectedTap === tap.id;
            return (
              <button
                key={tap.id}
                type="button"
                onClick={() => handleTapClick(tap)}
                className={`tap-button ${isSelected ? 'active' : ''}`}
              >
                <span>{tap.label}</span>
                {isSelected && <span style={{ fontSize: '10px', fontWeight: 800 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prospect's Own Words (Dedicated Box) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: isStage5 ? 'var(--accent-amber)' : 'var(--text-dim)'
          }}>
            Prospect's own words {isStage5 && '★ CRITICAL STAGE 5 VERBATIM'}
          </p>

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            style={{
              background: isRecording ? '#EF4444' : 'transparent',
              color: isRecording ? '#FFFFFF' : 'var(--text-dim)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}
            title="Dictate speech into box"
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            <span>{isRecording ? 'Listening...' : 'Dictate'}</span>
          </button>
        </div>

        <textarea
          rows={isStage5 ? 3 : 2}
          value={prospectWords}
          onChange={(e) => setProspectWords(e.target.value)}
          placeholder={stage.default_words_prompt || "Type the prospect's exact words..."}
          style={{
            width: '100%',
            background: 'var(--bg-dark)',
            border: isStage5 ? '2px solid var(--accent-amber)' : '1px solid var(--surface-border)',
            borderRadius: '6px',
            padding: '0.625rem 0.875rem',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            resize: 'vertical',
            outline: 'none',
            boxShadow: isStage5 ? '0 0 10px rgba(245, 158, 11, 0.15)' : 'none'
          }}
          onFocus={(e) => {
            if (!isStage5) e.target.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            if (!isStage5) e.target.style.borderColor = 'var(--surface-border)';
          }}
        />
      </div>

      {/* AI Live Co-Pilot Coaching Pill */}
      <AiCoPilot
        stage={stage}
        actionTapped={selectedTap}
        prospectWords={prospectWords}
        companyName={call?.company_name}
        prospectName={call?.prospect_name}
        prospectRole={call?.prospect_role}
      />

      {/* Navigation Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--surface-border)',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {stage.stage_number > 1 && (
            <button
              type="button"
              onClick={onPrevStage}
              className="btn-secondary"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={onEndCall}
            className="btn-danger"
            title="End call now (calls frequently drop or end early)"
          >
            <PhoneOff size={15} />
            <span>End Call</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="btn-primary"
          style={{ minWidth: '180px' }}
        >
          <span>{nextStageName ? `Next: ${nextStageName}` : 'Finish & Close Call'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
