import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export default function StageNavigator({
  stages = [],
  currentStageNumber = 1,
  onSelectStage,
  completedStages = {}
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      overflowX: 'auto',
      padding: '0.75rem 0.5rem',
      borderBottom: '1px solid var(--surface-border)',
      background: 'var(--surface-dark)'
    }}>
      {stages.map((stage) => {
        const isCurrent = stage.stage_number === currentStageNumber;
        const isDone = !!completedStages[stage.stage_number];

        return (
          <button
            key={stage.stage_number}
            onClick={() => onSelectStage(stage.stage_number)}
            className={`stage-tab ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            title={stage.short_purpose}
            style={{
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '2px',
              background: isCurrent ? '#FFFFFF' : isDone ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
              color: isCurrent ? 'var(--primary)' : isDone ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)'
            }}>
              {isDone && !isCurrent ? <Check size={12} strokeWidth={3} /> : stage.stage_number}
            </span>
            <span>{stage.name}</span>
          </button>
        );
      })}
    </div>
  );
}
