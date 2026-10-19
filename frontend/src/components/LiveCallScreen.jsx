import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Clock, User, Building2, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import StageNavigator from './StageNavigator';
import StageCard from './StageCard';
import CallCloseModal from './CallCloseModal';
import { saveStageResult, closeCall } from '../services/api';

export default function LiveCallScreen({
  call,
  stages = [],
  onCallClosed,
  onOpenNewCallModal
}) {
  const [currentStageNumber, setCurrentStageNumber] = useState(call.current_stage || 1);
  const [durationSeconds, setDurationSeconds] = useState(call.duration_seconds || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [completedStages, setCompletedStages] = useState({});

  // Sync saved stages on load
  useEffect(() => {
    if (call?.stages) {
      const stageMap = {};
      call.stages.forEach(s => {
        stageMap[s.stage_number] = s;
      });
      setCompletedStages(stageMap);
    }
  }, [call]);

  // Live Stopwatch
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const currentStage = stages.find(s => s.stage_number === currentStageNumber) || stages[0];
  const nextStage = stages.find(s => s.stage_number === currentStageNumber + 1);

  // Save current stage and move to next
  const handleSaveStageAndNext = async (stageData) => {
    try {
      // Optimistic state update
      setCompletedStages(prev => ({
        ...prev,
        [stageData.stage_number]: stageData
      }));

      // Background save to backend
      saveStageResult(call.id, {
        ...stageData,
        duration_seconds: durationSeconds
      }).catch(err => console.warn('Could not save stage result:', err));

      if (nextStage) {
        setCurrentStageNumber(nextStage.stage_number);
      } else {
        // Reached end of Stage 8 -> open Close Modal
        setShowCloseModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevStage = () => {
    if (currentStageNumber > 1) {
      setCurrentStageNumber(currentStageNumber - 1);
    }
  };

  const handleFinalSaveAndExit = async (closeData) => {
    try {
      setIsTimerRunning(false);
      await closeCall(call.id, closeData);
      setShowCloseModal(false);
      onCallClosed();
    } catch (err) {
      console.error(err);
      alert('Error closing call: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1rem' }}>
      {/* Live Call Top Card (beside the caller mid-call) */}
      <div style={{
        background: 'var(--surface-dark)',
        border: '2px solid var(--surface-border)',
        borderRadius: '8px 8px 0 0',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: 'none'
      }}>
        {/* Prospect Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="live-pulse" title="Call in progress" />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {call.prospect_name}
            </h1>
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(0, 41, 255, 0.15)',
              color: '#38BDF8',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              {call.company_kind}
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <strong>{call.prospect_role}</strong> · {call.company_name} {call.phone_number ? `(${call.phone_number})` : ''}
          </p>
        </div>

        {/* Stopwatch & End Call button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-dark)',
            border: '1px solid var(--surface-border)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem'
          }}>
            <Clock size={15} color="var(--primary)" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-main)'
            }}>
              {formatTimer(durationSeconds)}
            </span>
          </div>

          <button
            onClick={() => setShowCloseModal(true)}
            className="btn-danger"
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem' }}
            title="End Call and log outcome"
          >
            <PhoneOff size={14} />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* 8-Stage Tracker */}
      <StageNavigator
        stages={stages}
        currentStageNumber={currentStageNumber}
        onSelectStage={(num) => setCurrentStageNumber(num)}
        completedStages={completedStages}
      />

      {/* Active Stage Card */}
      <div style={{ marginTop: '0.75rem' }}>
        <StageCard
          stage={currentStage}
          call={call}
          currentStageNumber={currentStageNumber}
          totalStages={stages.length}
          nextStageName={nextStage ? nextStage.name : null}
          onSaveStageAndNext={handleSaveStageAndNext}
          onPrevStage={handlePrevStage}
          onEndCall={() => setShowCloseModal(true)}
          savedStageData={completedStages[currentStageNumber] || null}
        />
      </div>

      {/* Call Close Modal */}
      {showCloseModal && (
        <CallCloseModal
          call={call}
          stages={Object.values(completedStages)}
          currentStageNumber={currentStageNumber}
          durationSeconds={durationSeconds}
          onClose={() => setShowCloseModal(false)}
          onSaveAndExit={handleFinalSaveAndExit}
        />
      )}
    </div>
  );
}
