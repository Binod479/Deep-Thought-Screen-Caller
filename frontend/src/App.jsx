import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, List, Settings, Sun, Moon, Activity, Sparkles, ExternalLink } from 'lucide-react';
import LiveCallScreen from './components/LiveCallScreen';
import PastCallsScreen from './components/PastCallsScreen';
import NewCallModal from './components/NewCallModal';
import SettingsModal from './components/SettingsModal';
import { fetchStages, listCalls, startCall, checkBackendHealth } from './services/api';

// Fallback 8 stages if backend is asleep
const DEFAULT_STAGES = [
  {
    stage_number: 1,
    name: "Opening",
    short_purpose: "Reach right person & say who you are",
    what_it_is_for: "Reach the right person and say who you are. The prospect decides in the first ten seconds whether this call is worth a minute.",
    prospect_says: [
      "\"Yes, tell me. Who is this?\"",
      "\"Can you please come again? From where are you calling?\"",
      "\"I am driving / in a meeting right now. Call back after 2.\"",
      "\"He doesn't work here anymore / left the company last year.\""
    ],
    quick_taps: [
      { id: "reached_prospect", label: "Reached prospect directly" },
      { id: "assistant_gatekeeper", label: "Switchboard / Gatekeeper" },
      { id: "busy_driving_meeting", label: "Busy / Driving / In meeting" },
      { id: "wrong_person_moved", label: "Wrong person / Left company" }
    ],
    default_words_prompt: "e.g., 'Yes speaking, tell me quickly' or 'Driver here, sir is in meeting'"
  },
  {
    stage_number: 2,
    name: "Purpose",
    short_purpose: "Say in 1-2 sentences why you called",
    what_it_is_for: "Say in one or two sentences why you called, in words the prospect can repeat to a colleague. A purpose they cannot repeat is a purpose they did not hear.",
    prospect_says: [
      "\"Uh, from where? Meridian who? What do you do basically?\"",
      "\"Regarding what, actually? What does a growth report mean?\"",
      "\"Who gave you this number? Is this a sales call?\"",
      "\"Okay, tell me, boliye. What is the context?\""
    ],
    quick_taps: [
      { id: "asked_what_we_do", label: "Asked what company does" },
      { id: "asked_growth_report", label: "Asked what report means" },
      { id: "asked_number_source", label: "Asked who gave number" },
      { id: "called_it_sales", label: "Called it a sales call" },
      { id: "let_continue", label: "Understood & let me continue" }
    ],
    default_words_prompt: "e.g., 'What is this regarding basically?'"
  },
  {
    stage_number: 3,
    name: "Permission",
    short_purpose: "Find out if willing to talk now",
    what_it_is_for: "Find out whether they are willing to talk now. A clear yes, a clear no, or a time to call back are all good outcomes. Talking on without one is not.",
    prospect_says: [
      "\"Yeah, go ahead. / Yes, please proceed.\"",
      "\"Send it on WhatsApp first. Let me have a look and come back.\"",
      "\"Can you call me in an hour or evening? Currently tied up.\"",
      "\"Not right now, we are busy / still a startup so don't need this.\""
    ],
    quick_taps: [
      { id: "clear_yes_go_ahead", label: "Clear yes ('Go ahead')" },
      { id: "send_whatsapp_email", label: "Send on WhatsApp / email first" },
      { id: "call_back_named_time", label: "Call back at named time" },
      { id: "short_reluctant", label: "Brief / 'Tell me quickly'" },
      { id: "firm_no", label: "Clear no / Not now" }
    ],
    default_words_prompt: "e.g., 'Send on WhatsApp to this number, let me see'"
  },
  {
    stage_number: 4,
    name: "Their business",
    short_purpose: "Ask about their company first",
    what_it_is_for: "Ask about their company and their work before saying anything about yours. People talk about what they do; they rarely listen to what you do.",
    prospect_says: [
      "\"We only deal in domestic market, no exports anymore.\"",
      "\"We have a local distributor in Hyderabad (Orion) who handles business.\"",
      "\"I only look after engineering/sustainability, finance is different.\"",
      "\"Tell me about Meridian first, what clients have you worked with?\""
    ],
    quick_taps: [
      { id: "shared_business_scope", label: "Shared business scope / line" },
      { id: "corrected_size_product", label: "Corrected division / product" },
      { id: "mentioned_distributor", label: "Has distributor / agency" },
      { id: "challenged_caller", label: "Asked caller credentials first" }
    ],
    default_words_prompt: "e.g., 'We are in domestic B2B supply, we don't do export'"
  },
  {
    stage_number: 5,
    name: "Their need, in their words",
    short_purpose: "Hear what they are struggling with",
    what_it_is_for: "Hear what they are trying to do or struggling with, in their own words. This is the one stage where the caller writes down exactly what was said.",
    prospect_says: [
      "\"Next week we'll have a clearer idea of products and where to push.\"",
      "\"We have a robust internal process and team, we don't require outside help.\"",
      "\"In this line we don't believe in experiments, we are fine with old clients.\"",
      "\"What exactly would your growth report identify for a business like ours?\""
    ],
    quick_taps: [
      { id: "named_growth_goal", label: "Named growth goal / new product" },
      { id: "operational_bottleneck", label: "Shared bottleneck (capacity/margin)" },
      { id: "satisfied_no_need", label: "Satisfied / 'Everything is fine'" },
      { id: "asked_value_add", label: "Asked what Meridian solves" }
    ],
    default_words_prompt: "Write verbatim: 'Our margins are getting squeezed by raw material suppliers...'"
  },
  {
    stage_number: 6,
    name: "Objection",
    short_purpose: "Hear the reason for a no",
    what_it_is_for: "Hear the reason for a no and understand it. A reason you understand can be answered on this call or the next; a reason you talked over cannot.",
    prospect_says: [
      "\"Meri internal team hai, we don't hire outside consultants.\"",
      "\"I am not the right person. Better be in touch with our CFO / MD.\"",
      "\"I am not interested in any reports or growth consulting at this time.\"",
      "\"We are not allowed to share financial or innovation data, company policy.\"",
      "\"Just drop an email with your profile. I will discuss with team.\""
    ],
    quick_taps: [
      { id: "has_internal_team", label: "Has agency / in-house team" },
      { id: "wrong_dept_referral", label: "Not right person (gives referral)" },
      { id: "not_interested_now", label: "Firm not interested" },
      { id: "policy_data_secrecy", label: "Policy / won't share data" },
      { id: "send_info_brush_off", label: "Brush off: 'Send email and we'll see'" }
    ],
    default_words_prompt: "e.g., 'We already have our own strategy team, no need for third party'"
  },
  {
    stage_number: 7,
    name: "Next step",
    short_purpose: "Agree one concrete document or time",
    what_it_is_for: "Agree one concrete thing: a document on WhatsApp or email, a call at a named time, a meeting. One thing, named, with a time or a channel.",
    prospect_says: [
      "\"Send it on WhatsApp on the same number, I will check it.\"",
      "\"Call us next Tuesday after 2 PM for a working session / Google Meet.\"",
      "\"Connect with Mr. Naik / Mr. Suresh [shares direct mobile number].\"",
      "\"Bump up the email you sent last week, I will reply.\""
    ],
    quick_taps: [
      { id: "whatsapp_report_agreed", label: "Send report on WhatsApp" },
      { id: "scheduled_call_time", label: "Fixed callback date & time" },
      { id: "founder_meeting_meet", label: "Agreed to Google Meet with founder" },
      { id: "referred_colleague_num", label: "Referred colleague with phone #" },
      { id: "email_sent_to_review", label: "Email profile / bump thread" }
    ],
    default_words_prompt: "e.g., 'Send report on WhatsApp, call me Tuesday 2:30 PM'"
  },
  {
    stage_number: 8,
    name: "Close",
    short_purpose: "End clearly and record true outcome",
    what_it_is_for: "End the call clearly and record what happened: the outcome, the next step, and the prospect's words from stage 5. The record is what the next call is built on.",
    prospect_says: [
      "\"Okay, thank you Priya ji. Send it over.\"",
      "\"Alright, thank you. [Disconnects]\"",
      "\"Thank you for calling, but as I said, we are fine. Bye.\"",
      "[Line drops mid-sentence / call abruptly disconnected]"
    ],
    quick_taps: [
      { id: "clear_next_step_locked", label: "Clear next step agreed & verified" },
      { id: "report_dispatch_pending", label: "Report consent given" },
      { id: "polite_no_closed", label: "Polite dismissal (True No)" },
      { id: "line_dropped_hangup", label: "Line dropped / hung up" },
      { id: "do_not_contact", label: "Asked not to call again" }
    ],
    default_words_prompt: "Final notes or exact closing phrase"
  }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState('live'); // 'live' or 'past'
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [calls, setCalls] = useState([]);
  const [currentCall, setCurrentCall] = useState({
    id: "active-call-01",
    caller_name: "Arjun (Meridian)",
    prospect_name: "Dr. Anjali Menon",
    prospect_role: "Owner & Managing Director",
    company_name: "Menon Diagnostics & Clinics",
    company_kind: "mid-size private company",
    phone_number: "+91 98490 88211",
    status: "in_progress",
    current_stage: 2,
    max_stage_reached: 2,
    duration_seconds: 134,
    stages: [
      { stage_number: 1, stage_name: "Opening", action_tapped: "reached_prospect", action_label: "Reached prospect directly", prospect_words: "Yes, Dr. Menon speaking. Tell me." }
    ]
  });

  const [theme, setTheme] = useState(localStorage.getItem('meridian_theme') || 'dark');
  const [backendOnline, setBackendOnline] = useState(false);
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loadingCalls, setLoadingCalls] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('meridian_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load stages and calls on mount
  useEffect(() => {
    async function initData() {
      // 1. Health check
      try {
        await checkBackendHealth();
        setBackendOnline(true);
      } catch (e) {
        console.warn('Backend not yet reachable:', e.message);
        setBackendOnline(false);
      }

      // 2. Fetch stages
      try {
        const stageRes = await fetchStages();
        if (stageRes?.stages?.length > 0) {
          setStages(stageRes.stages);
        }
      } catch (e) {
        console.warn('Using default 8 stages reference:', e.message);
      }

      // 3. Fetch past calls
      loadCalls();
    }

    initData();
  }, []);

  const loadCalls = async () => {
    setLoadingCalls(true);
    try {
      const res = await listCalls();
      if (res?.calls) {
        setCalls(res.calls);
      }
    } catch (e) {
      console.warn('Could not load calls from backend:', e.message);
    } finally {
      setLoadingCalls(false);
    }
  };

  const handleStartCall = async (payload) => {
    try {
      let createdCall = null;
      try {
        const res = await startCall(payload);
        if (res?.call) createdCall = res.call;
      } catch (err) {
        console.warn('Backend start call offline fallback:', err);
      }

      if (!createdCall) {
        createdCall = {
          id: 'call_' + Date.now(),
          ...payload,
          status: 'in_progress',
          current_stage: 1,
          max_stage_reached: 1,
          duration_seconds: 0,
          created_at: new Date().toISOString(),
          stages: []
        };
      }

      setCurrentCall(createdCall);
      setShowNewCallModal(false);
      setActiveScreen('live');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCallClosed = () => {
    loadCalls();
    setActiveScreen('past');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'var(--surface-dark)',
        borderBottom: '1px solid var(--surface-border)',
        padding: '0 1.25rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px'
            }}>
              M
            </span>
            <div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)'
              }}>
                Meridian <span style={{ color: 'var(--primary)' }}>Growth</span>
              </span>
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-dim)',
                marginLeft: '0.5rem',
                display: 'inline-block'
              }}>
                CALL SCREEN
              </span>
            </div>
          </div>

          {/* Screen Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-dark)',
            padding: '0.2rem',
            borderRadius: '6px',
            border: '1px solid var(--surface-border)'
          }}>
            <button
              onClick={() => setActiveScreen('live')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                background: activeScreen === 'live' ? 'var(--primary)' : 'transparent',
                color: activeScreen === 'live' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="live-pulse" style={{ width: '6px', height: '6px' }} />
              <span>Live Call Screen</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('past');
                loadCalls();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                background: activeScreen === 'past' ? 'var(--primary)' : 'transparent',
                color: activeScreen === 'past' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <List size={14} />
              <span>Past Calls ({calls.length})</span>
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Backend Status indicator */}
          <div
            title={backendOnline ? 'Backend is awake and responding' : 'Backend offline or asleep (free tier)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              background: backendOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: backendOnline ? '#34D399' : '#FBBF24',
              border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
            }}
          >
            <Activity size={12} />
            <span>{backendOnline ? 'API Awake' : 'Free Tier'}</span>
          </div>

          {/* New Call Button */}
          <button
            onClick={() => setShowNewCallModal(true)}
            className="btn-primary"
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }}
          >
            <PhoneCall size={14} />
            <span>New Call</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '6px' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '6px' }}
            title="Connection & LLM settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeScreen === 'live' ? (
          <LiveCallScreen
            call={currentCall}
            stages={stages}
            onCallClosed={handleCallClosed}
            onOpenNewCallModal={() => setShowNewCallModal(true)}
          />
        ) : (
          <PastCallsScreen
            calls={calls}
            loading={loadingCalls}
            onRefresh={loadCalls}
            onStartNewCall={() => setShowNewCallModal(true)}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer style={{
        borderTop: '1px solid var(--surface-border)',
        background: 'var(--surface-dark)',
        padding: '0.75rem 1.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <span>Meridian Growth Partners Cold Call Surface · Built on 100 Real Transcripts</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>Vercel (Frontend)</span>
          <span>Render (Backend)</span>
          <span>Supabase (PostgreSQL)</span>
          <span>LLM (Gemini 2.0 / Groq)</span>
        </div>
      </footer>

      {/* Modals */}
      {showNewCallModal && (
        <NewCallModal
          onClose={() => setShowNewCallModal(false)}
          onStartCall={handleStartCall}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
