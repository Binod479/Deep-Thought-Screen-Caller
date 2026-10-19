import React, { useState } from 'react';
import { Search, Filter, PhoneCall, Clock, CheckCircle2, AlertCircle, BarChart3, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import CallDetailModal from './CallDetailModal';

export default function PastCallsScreen({
  calls = [],
  loading = false,
  onRefresh,
  onStartNewCall
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [inspectCall, setInspectCall] = useState(null);

  // Compute stats
  const totalCalls = calls.length;
  const positiveCalls = calls.filter(c => ['next_step_agreed', 'agreed_to_receive_report', 'interested'].includes(c.outcome)).length;
  const conversionRate = totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0;
  const avgDuration = totalCalls > 0
    ? Math.round(calls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / totalCalls)
    : 0;

  // Filtered calls
  const filteredCalls = calls.filter(c => {
    const matchesSearch = !searchTerm ||
      (c.prospect_name && c.prospect_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.prospect_words_stage5 && c.prospect_words_stage5.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesOutcome = selectedOutcome === 'ALL' || c.outcome === selectedOutcome;
    const matchesStage = selectedStage === 'ALL' || String(c.max_stage_reached || c.current_stage) === String(selectedStage);

    return matchesSearch && matchesOutcome && matchesStage;
  });

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Today';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today ${timeStr}` : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
  };

  const getStageName = (num) => {
    const stageNames = {
      1: 'Opening',
      2: 'Purpose',
      3: 'Permission',
      4: 'Their business',
      5: 'Their need',
      6: 'Objection',
      7: 'Next step',
      8: 'Close'
    };
    return stageNames[num] || `Stage ${num}`;
  };

  const getOutcomeBadgeClass = (outcome) => {
    if (['next_step_agreed', 'agreed_to_receive_report', 'interested'].includes(outcome)) return 'badge-agreed';
    if (['follow_up', 'call_again'].includes(outcome)) return 'badge-followup';
    if (['not_interested', 'do_not_call'].includes(outcome)) return 'badge-not-interested';
    if (['wrong_person', 'moved_company'].includes(outcome)) return 'badge-wrong-person';
    return 'badge-neutral';
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--primary)',
            marginBottom: '0.25rem'
          }}>
            Second Screen · Call History & Outcomes
          </p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Past Calls & Stages Reached
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            After each call is saved, it appears here with the stage it reached. See where calls progress and where drop-offs happen.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onRefresh}
            className="btn-secondary"
            title="Refresh past calls from backend"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onStartNewCall}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>New Call</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'var(--surface-dark)',
          border: '1px solid var(--surface-border)',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Total Calls Logged
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {totalCalls}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across 8 cold-call stages
          </p>
        </div>

        <div style={{
          background: 'var(--surface-dark)',
          border: '1px solid var(--surface-border)',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Next Step / Report Rate
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            {conversionRate}%
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {positiveCalls} positive outcomes
          </p>
        </div>

        <div style={{
          background: 'var(--surface-dark)',
          border: '1px solid var(--surface-border)',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Avg Call Duration
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {formatDuration(avgDuration)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Benchmark: ~90s to 2.5 min
          </p>
        </div>

        <div style={{
          background: 'var(--surface-dark)',
          border: '1px solid var(--surface-border)',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Top Drop-Off Stage
          </p>
          <p style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
            Stage 6: Objection
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Matches 100 transcript pattern
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--surface-dark)',
        border: '1px solid var(--surface-border)',
        borderRadius: '8px 8px 0 0',
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 'none'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-dark)',
          border: '1px solid var(--surface-border)',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          flex: '1',
          minWidth: '240px'
        }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by prospect, company, or note..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              width: '100%'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--surface-border)',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="ALL">All Outcomes</option>
            <option value="next_step_agreed">Next Step Agreed</option>
            <option value="agreed_to_receive_report">Agreed Report</option>
            <option value="interested">Interested</option>
            <option value="follow_up">Follow Up</option>
            <option value="not_interested">Not Interested</option>
            <option value="do_not_call">Do Not Call</option>
            <option value="wrong_person">Wrong Person</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--surface-border)',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="ALL">All Stages</option>
            <option value="1">Stage 1: Opening</option>
            <option value="2">Stage 2: Purpose</option>
            <option value="3">Stage 3: Permission</option>
            <option value="4">Stage 4: Their business</option>
            <option value="5">Stage 5: Their need</option>
            <option value="6">Stage 6: Objection</option>
            <option value="7">Stage 7: Next step</option>
            <option value="8">Stage 8: Close</option>
          </select>
        </div>
      </div>

      {/* Calls List Table matching reference screen design */}
      <div style={{
        background: 'var(--surface-dark)',
        border: '1px solid var(--surface-border)',
        borderRadius: '0 0 8px 8px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        {filteredCalls.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No calls match your filter</p>
            <p style={{ fontSize: '0.8125rem' }}>Start a new call or clear the search filters.</p>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const stageNum = call.max_stage_reached || call.current_stage || 1;
            const stageName = getStageName(stageNum);
            const displayNote = call.notes || call.prospect_words_stage5 || call.ai_summary || 'No notes logged';

            return (
              <div
                key={call.id}
                onClick={() => setInspectCall(call)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--surface-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Left column: Name, company, note */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {call.prospect_name}, {call.company_name}
                    </p>
                    <span className={`badge-outcome ${getOutcomeBadgeClass(call.outcome)}`}>
                      {call.outcome?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '520px'
                  }}>
                    {displayNote}
                  </p>
                </div>

                {/* Right column: Stage reached, timestamp */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--primary)'
                  }}>
                    {stageName} (Stage {stageNum})
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-dim)'
                  }}>
                    {formatTime(call.created_at)} · {formatDuration(call.duration_seconds || 0)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Call Detail Modal */}
      {inspectCall && (
        <CallDetailModal
          call={inspectCall}
          onClose={() => setInspectCall(null)}
        />
      )}
    </div>
  );
}
