// LLM Client for Cold Call Live Screen
// Supports Google Gemini, Groq, and Transcript-Grounded Heuristic Fallback

const http = require('https');

// Transcript-grounded heuristic coaching bank for Meridian Growth Partners
const heuristicPivots = {
  1: { // Opening
    reached_prospect: "Hi [Prospect], I'll be brief—I'm calling from Meridian in Hyderabad regarding [Company]'s growth initiatives.",
    assistant_gatekeeper: "Could you connect me with [Prospect]'s desk regarding the growth analysis report for [Company]?",
    busy_driving_meeting: "Understood, drive safe! I'll ping a 1-line note on WhatsApp and call you back tomorrow afternoon.",
    wrong_person_moved: "My apologies—who currently oversees operations and strategic planning for [Company]?"
  },
  2: { // Purpose
    asked_what_we_do: "Meridian studies fast-growing mid-size companies to identify operational bottlenecks and margin opportunities.",
    asked_growth_report: "It's an independent 3-page study comparing your growth and margins against peers, with zero data needed from you.",
    asked_number_source: "Our research desk tracks leading Indian manufacturers from public trade registries and industry directories.",
    called_it_sales: "Not selling software or services today, sir—just sharing our research profile on [Company] to see if it adds value.",
    let_continue: "We’ve seen similar leaders expand margins by 4-6% by removing hidden plant bottlenecks."
  },
  3: { // Permission
    clear_yes_go_ahead: "Can I ask two quick questions to see how your idea of growth aligns with what we found?",
    send_whatsapp_email: "Happy to send it on WhatsApp right away—is this number active on WhatsApp?",
    call_back_named_time: "Noted! I'll call you sharp at that time—should I WhatsApp the 1-page summary beforehand?",
    short_reluctant: "Just 60 seconds: does your team actively review peer margin benchmarks?",
    firm_no: "Understood completely. May I leave our 1-page sector benchmark on your WhatsApp for future reference?"
  },
  4: { // Their business
    shared_business_scope: "That makes sense—how is the domestic capacity utilization looking across your plants this quarter?",
    corrected_size_product: "Thank you for correcting that. With that specific product line, what's your biggest barrier to faster delivery?",
    mentioned_distributor: "Understood, distributor relationships are critical—do they handle all regional market expansion?",
    challenged_caller: "We've worked with 40+ Indian mid-market leaders in industrial equipment and chemicals on growth bottleneck mapping."
  },
  5: { // Their need, in their words
    named_growth_goal: "That's an ambitious target—what is the single biggest operational friction holding you back from hitting that?",
    operational_bottleneck: "We frequently see that bottleneck across peers—our report maps how top players bypassed that exact constraint.",
    satisfied_no_need: "Running smooth is the best time to benchmark margins before the next expansion phase.",
    asked_value_add: "Our report highlights 3 specific areas where peer companies gained margin advantages without capital expenditure."
  },
  6: { // Objection
    has_internal_team: "An internal team is essential. Our report simply gives them an external peer benchmark they can leverage internally.",
    wrong_dept_referral: "Understood! Would it be better if I speak with your CFO, and may I mention you suggested I reach out?",
    not_interested_now: "Completely fair, no pitch at all. Can I simply WhatsApp our 2-page research draft so you have it handy?",
    policy_data_secrecy: "We don't need any internal numbers—all our analysis is built strictly from external peer and sector data.",
    send_info_brush_off: "I'll WhatsApp it over right now. If it has even one useful peer insight, can we reconnect for 5 minutes next Tuesday?"
  },
  7: { // Next step
    whatsapp_report_agreed: "Sending to this number now. Would Tuesday 3 PM be a good time to follow up for 5 minutes once you've seen it?",
    scheduled_call_time: "Locked in for that time. I'll send a Google Meet invite and WhatsApp confirmation right now.",
    founder_meeting_meet: "Fantastic, our founder Vikram will join the call to walk through the growth levers tailored for [Company].",
    referred_colleague_num: "Thank you for the direct contact. I will reach out to them and mention your guidance.",
    email_sent_to_review: "Bumping the email to your inbox now with subject 'Meridian Growth Partners - [Company] Profile'."
  },
  8: { // Close
    clear_next_step_locked: "Thank you for your time [Prospect] ji. Looking forward to our discussion on Tuesday.",
    report_dispatch_pending: "Thank you, dispatching the report to your WhatsApp shortly. Have a great day ahead.",
    polite_no_closed: "Thank you for your time and clarity, [Prospect]. Wishing [Company] continuous success.",
    line_dropped_hangup: "Call dropped. Logging stage reached and queuing a respectful WhatsApp follow-up.",
    do_not_contact: "Noted with respect. Updating our records immediately not to reach out further."
  }
};

/**
 * Call Google Gemini API
 */
async function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 250
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            resolve(json.candidates[0].content.parts[0].text);
          } else if (json.error) {
            reject(new Error(json.error.message || 'Gemini API Error'));
          } else {
            reject(new Error('Unexpected Gemini response: ' + data.slice(0, 200)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Call Groq API
 */
async function callGroq(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an elite live cold-call coach for Meridian Growth Partners calling Indian business executives. Keep responses under 25 words.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.choices && json.choices[0]?.message?.content) {
            resolve(json.choices[0].message.content);
          } else if (json.error) {
            reject(new Error(json.error.message || 'Groq API Error'));
          } else {
            reject(new Error('Unexpected Groq response: ' + data.slice(0, 200)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Generate Live Coach Pivot
 */
async function generateCoachPivot({
  stageNumber,
  stageName,
  actionTapped,
  prospectWords,
  companyName = 'the company',
  prospectName = 'sir',
  prospectRole = 'Director',
  customApiKey = null,
  provider = null
}) {
  const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
  const groqKey = customApiKey || process.env.GROQ_API_KEY;

  const prompt = `You are a live real-time coach sitting beside a caller from Meridian Growth Partners (Hyderabad).
We create growth analysis reports for mid-size Indian companies.
Current Context:
- Prospect: ${prospectName} (${prospectRole} at ${companyName})
- Current Call Stage: Stage ${stageNumber} (${stageName})
- Action Tapped by Caller: ${actionTapped || 'None'}
- Prospect's Verbatim Words: "${prospectWords || 'N/A'}"

Provide a JSON response with:
1. "pivotSentence": EXACTLY ONE natural, crisp, conversational sentence (max 22 words) the caller should speak OUT LOUD to the prospect right now.
2. "intent": 1-3 words describing the prospect's stance (e.g., Gatekeeping, Skeptical, Time Pressure, Curious, Receptive).
3. "coachingTip": One sharp tactical tip for the caller in under 12 words.

Output valid JSON only:
{"pivotSentence": "...", "intent": "...", "coachingTip": "..."}`;

  // Try Groq or Gemini if keys are present
  if (groqKey && (provider === 'groq' || !provider)) {
    try {
      const raw = await callGroq(groqKey, prompt);
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return { ...parsed, source: 'groq (llama-3.3-70b)' };
    } catch (e) {
      console.warn('Groq call failed, falling back:', e.message);
    }
  }

  if (geminiKey && (provider === 'gemini' || !provider)) {
    try {
      const raw = await callGemini(geminiKey, prompt);
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return { ...parsed, source: 'gemini-2.0-flash' };
    } catch (e) {
      console.warn('Gemini call failed, falling back:', e.message);
    }
  }

  // Heuristic transcript fallback
  const stagePivots = heuristicPivots[stageNumber] || heuristicPivots[2];
  let pivot = stagePivots[actionTapped] || Object.values(stagePivots)[0];
  pivot = pivot.replace(/\[Company\]/g, companyName).replace(/\[Prospect\]/g, prospectName);

  let intent = 'Neutral / Evaluating';
  if (actionTapped && actionTapped.includes('busy')) intent = 'Time Constraint';
  else if (actionTapped && actionTapped.includes('internal')) intent = 'Gatekeeping / In-house';
  else if (actionTapped && actionTapped.includes('whatsapp')) intent = 'Receptive via WhatsApp';
  else if (actionTapped && actionTapped.includes('not_interested')) intent = 'Decline / Resistant';

  return {
    pivotSentence: pivot,
    intent: intent,
    coachingTip: "Stay calm, do not over-explain. One sentence, then pause and listen.",
    source: "transcript-trained-heuristic"
  };
}

/**
 * Generate AI Summary for Stage 8 Close / CRM
 */
async function generateCallSummary({
  call,
  stages = [],
  customApiKey = null,
  provider = null
}) {
  const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
  const groqKey = customApiKey || process.env.GROQ_API_KEY;

  const stageDescriptions = stages.map(s => `Stage ${s.stage_number} (${s.stage_name}): Tapped '${s.action_label || s.action_tapped}' | Prospect Words: "${s.prospect_words || ''}"`).join('\n');

  const prompt = `Generate a concise CRM call debrief for this cold call by Meridian Growth Partners:
Prospect: ${call.prospect_name} (${call.prospect_role}) at ${call.company_name}
Duration: ${call.duration_seconds || 60} seconds
Outcome Logged: ${call.outcome || 'not_logged'}
Stage Timeline:
${stageDescriptions}
Prospect Verbatim from Stage 5: "${call.prospect_words_stage5 || 'None'}"

Provide JSON:
{
  "summary": "Two sentences summarizing what occurred and the exact final state.",
  "painPoint": "Core business friction or objection identified, in under 15 words.",
  "nextAction": "One clear concrete next task for the CRM (e.g., 'WhatsApp report on Monday 11am' or 'Archive - do not call').",
  "sentiment": "Receptive | Skeptical | Neutral | Busy | Hostile"
}`;

  if (groqKey && (provider === 'groq' || !provider)) {
    try {
      const raw = await callGroq(groqKey, prompt);
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return { ...JSON.parse(clean), source: 'groq' };
    } catch (e) {
      console.warn('Groq summary failed:', e.message);
    }
  }

  if (geminiKey && (provider === 'gemini' || !provider)) {
    try {
      const raw = await callGemini(geminiKey, prompt);
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return { ...JSON.parse(clean), source: 'gemini' };
    } catch (e) {
      console.warn('Gemini summary failed:', e.message);
    }
  }

  // Heuristic summary fallback
  return {
    summary: `Call reached Stage ${call.max_stage_reached || call.current_stage || 1}. Prospect concluded with outcome '${call.outcome}'. Key notes recorded in stage progression.`,
    painPoint: call.prospect_words_stage5 || "No specific bottleneck disclosed during the interaction.",
    nextAction: call.outcome === 'agreed_to_receive_report' ? 'Dispatch growth report draft via WhatsApp and calendar 3-day follow-up.' :
                call.outcome === 'next_step_agreed' ? 'Confirm meeting calendar invite and link with founder.' :
                call.outcome === 'follow_up' ? 'Schedule callback at the prospect-specified window.' : 'Archive record; review in next quarter campaign.',
    sentiment: call.outcome === 'next_step_agreed' || call.outcome === 'agreed_to_receive_report' ? 'Receptive' :
               call.outcome === 'not_interested' || call.outcome === 'do_not_call' ? 'Resistant' : 'Neutral',
    source: "transcript-trained-heuristic"
  };
}

module.exports = {
  generateCoachPivot,
  generateCallSummary
};
