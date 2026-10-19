# Meridian Caller · The Cold Call Screen

> A production-grade cold call surface designed for a caller to keep open beside the phone during live outbound calls to Indian business executives. Built on insights from **100 real cold-call transcripts**, powered by free-tier infrastructure (Vercel, Render, Supabase), and augmented with an **LLM Co-Pilot** delivering instant, real-time coaching pivots.

---

## 🔗 Live Deployments & Endpoints

| Resource | Service / Provider | Link / URL | Description |
|---|---|---|---|
| **Live Caller Screen** | **Vercel** (Free Tier) | `https://meridian-caller.vercel.app` *(or custom Vercel domain)* | The interactive surface the caller keeps open during live calls |
| **Backend API** | **Render** (Free Tier) | `https://meridian-caller.onrender.com` | Express REST API server (spins down on idle, auto-wakes) |
| **Health Endpoint** | **Render** | `https://meridian-caller.onrender.com/health` | Answers with status, uptime, service health, and LLM status |
| **Database** | **Supabase** (Free Tier) | PostgreSQL Database | Stores calls, stage progression, verbatim words, and outcomes |
| **GitHub Repository** | **GitHub** (Public) | Public Git Repository | Full source code (frontend, backend, Supabase schema SQL) |

---

## 🤖 The LLM In It: Provider & Use Case

### Model Selected
- **Primary:** **Google Gemini 2.0 Flash** (`gemini-2.0-flash` via Google AI Studio Free Tier Key)
- **High-Speed Alternative:** **Groq LLaMA 3.3 70B Versatile** (`llama-3.3-70b-versatile` via Groq Free Tier Key, ~250ms latency)
- **Zero-Setup Fallback:** **Transcript-Trained Heuristic Engine** (Contextual rule-engine trained on 100 Indian executive cold-call transcripts, ensuring 0ms latency and 100% reliability even if external API limits are exceeded).

### What the LLM is Used For
1. **Live 1-Sentence Tactical Objection Pivot (Mid-Call)**:
   - When a prospect raises an objection (e.g., *"Accounting for what? We have a CA"*, *"Meri internal team hai"*, or *"Who gave you this number?"*), the caller taps the event or types the phrase.
   - The LLM delivers **exactly one crisp, natural sentence** (under 22 words) for the caller to speak out loud immediately. It also classifies the prospect's real psychological stance (e.g., *Gatekeeping*, *Time Pressure*, *Deflective*, *Receptive*) and gives a sub-12-word tactical tip.
2. **Analysis of Prospect's Own Words (Stage 5)**:
   - At Stage 5 (*Their need, in their words*), the LLM parses the prospect's verbatim statement to uncover operational bottlenecks (plant capacity, margin pressures, distributor constraints) and formulate the pivot to Stage 7 (*Next step*).
3. **Automated CRM Call Debrief & Next Action (Stage 8 Close)**:
   - Synthesizes the full call timeline, stages reached, and verbatim notes into a structured 2-sentence executive summary, identifying core business friction and generating the concrete next calendar action.

---

## 📊 What Each Stage Shows (Derived from 100 Real Transcripts)

Analysis of all 100 calls from **Meridian Growth Partners** (reaching directors and senior managers across Indian manufacturing, tech, and private companies) revealed the following stage-by-stage dynamics:

```
[1. Opening] ───► [2. Purpose] ───► [3. Permission] ───► [4. Business]
      │                 │                  │                   │
      ▼                 ▼                  ▼                   ▼
 (Gatekeeper /     (Drop-off 1:      (WhatsApp brush-off    (Distributor /
   Meeting)         "Meridian who?")  vs "Go ahead")         Scope checks)
      │                 │                  │                   │
      ▼                 ▼                  ▼                   ▼
[8. Close]  ◄───  [7. Next step] ◄─── [6. Objection] ◄─── [5. Need in Own Words]
 (True outcome:   (Fixed Tuesday 2pm; (Drop-off 2:          (Verbatim box:
  Report / Call)   Google Meet Invite) "Internal team")      Margins, Capacity)
```

| Stage | Name | What It Is For | What Prospects Tend to Say (from Transcripts) | Taps & Verbatim Box on Screen |
|---|---|---|---|---|
| **1** | **Opening** | Reach the right person and say who you are. Prospect decides in 10 seconds if call is worth a minute. | • *"Yes, tell me. Who is this?"*<br>• *"Can you please come again? From where?"*<br>• *"Driving / in a meeting. Call after 2."*<br>• *"He left the company last year."* | **Taps:** Reached prospect directly, Switchboard/Gatekeeper, Busy/Driving, Wrong person/Moved.<br>**Box:** Reception notes. |
| **2** | **Purpose** | Say in 1–2 sentences why you called, in words they can repeat to a colleague. | • *"Uh, from where? Meridian who? What do you do?"*<br>• *"Regarding what? What does a growth report mean?"*<br>• *"Who gave you this number? Is this sales?"* | **Taps:** Asked what company does, Asked what report means, Asked number source, Called it sales call, Let me continue.<br>**Box:** Verbatim question. |
| **3** | **Permission** | Find out whether they are willing to talk now. | • *"Yeah, go ahead / tell me boliye."*<br>• *"Send on WhatsApp first. Let me see."*<br>• *"Call me in an hour or evening."*<br>• *"Not right now, we are a startup / busy."* | **Taps:** Clear yes ('Go ahead'), Send on WhatsApp/Email first, Call back named time, Short/Reluctant, Firm no.<br>**Box:** Stated time constraint. |
| **4** | **Their business** | Ask about their company and operations before pitching yours. | • *"We only deal in domestic market, no exports."*<br>• *"We have a distributor in Hyderabad (Orion)."*<br>• *"I only look after engineering, finance is different."*<br>• *"Tell me about Meridian first."* | **Taps:** Shared business scope, Corrected size/product, Mentioned distributor, Challenged caller credentials.<br>**Box:** Scope details. |
| **5** | **Their need, in their words** | Hear what they are trying to do or struggling with, in their own words. | • *"Next week we'll have a clearer idea of products."*<br>• *"We have an internal team, don't require help."*<br>• *"In this line we don't believe in experiments."*<br>• *"What exactly would your growth report identify?"* | **Taps:** Named growth goal, Operational bottleneck (capacity/margin), Satisfied/No need, Asked value add.<br>**Box (PROMINENT):** Exact words typed or dictated hands-free. |
| **6** | **Objection** | Hear the reason for a no and understand it without talking over them. | • *"Meri internal team hai, we don't hire consultants."*<br>• *"Not the right person. Talk to CFO / MD."*<br>• *"Not interested at this point in time."*<br>• *"Company policy doesn't allow sharing data."* | **Taps:** Has agency/in-house team, Wrong dept (gives referral), Firm not interested, Policy/data secrecy, Send email brush-off.<br>**Box:** Specific objection. |
| **7** | **Next step** | Agree one concrete thing: WhatsApp document, named callback time, or Google Meet. | • *"Send it on WhatsApp on the same number."*<br>• *"Call next Tuesday after 2 PM for working session."*<br>• *"Connect with Mr. Suresh [shares direct mobile]."*<br>• *"Bump up the email, I will reply."* | **Taps:** WhatsApp report agreed, Fixed callback date & time, Google Meet with founder agreed, Referred colleague with number, Email profile bump.<br>**Box:** Date/channel agreed. |
| **8** | **Close** | End clearly and record the true outcome, next step, and stage 5 words. | • *"Okay, thank you Priya ji. Send it over."*<br>• *"Alright, thank you. [Disconnects]"*<br>• *"Thank you for calling, but we are fine. Bye."*<br>• *[Line dropped mid-sentence]* | **Taps:** Clear next step locked, Report consent given, Polite dismissal (True No), Line dropped/hung up, Do not contact.<br>**Box:** Final closing remarks. |

---

## 📱 The Two Screens

### Screen 1: Live Call Screen (Mid-Call Surface)
- **Top Context Bar:** Prospect name, company kind, role, phone number, and a real-time counting stopwatch (`02:14`) with a pulsing green live indicator.
- **Stage Navigation:** 8-stage progress tracker showing active, completed (with checkmarks), and upcoming stages with 1-click stage jumping (for mid-call interruptions).
- **Tactile Tap Buttons:** Quick single-tap recording so the caller spends zero time typing during conversation.
- **Prospect's Words Box:** Verbatim input box with integrated speech-to-text dictation.
- **Live AI Co-Pilot Card:** One-click tactical coaching pivot to say out loud, prospect intent classification, and copy-to-clipboard button.
- **Always-Accessible "End Call" Button:** Can terminate and save from any stage since most cold calls end before Stage 8.

### Screen 2: Past Calls & Stages Reached (Post-Call Review & Second Screen)
- **Executive KPI Bar:** Total calls logged, report/meeting conversion rate, average call duration, and top drop-off stage analysis.
- **Search & Filters:** Real-time search by prospect name, company, or notes, with dropdown filters for outcomes and stages reached.
- **Call List Table:** Matching the reference screen specification:
  - Prospect Name & Company
  - Outcome badge (`next_step_agreed`, `agreed_to_receive_report`, `follow_up`, `not_interested`, etc.)
  - Subtitle with follow-up note or Stage 5 verbatim quote
  - Stage reached badge (e.g., `Stage 7 · Next step` in electric blue)
  - Duration and timestamp (`Today 11:40 · 01:15`)
- **Call Detail Drawer:** Opens any past call to inspect the full chronological timeline of stages visited, actions tapped, verbatim words, and AI CRM summary.

---

## 🗄️ Supabase Schema (`schema.sql`)

The PostgreSQL schema is structured for Supabase free tier:

```sql
-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_code VARCHAR(50),
    caller_name VARCHAR(100) NOT NULL DEFAULT 'Arjun (Meridian)',
    prospect_name VARCHAR(100) NOT NULL,
    prospect_role VARCHAR(150),
    company_name VARCHAR(150) NOT NULL,
    company_kind VARCHAR(100) DEFAULT 'mid-size private company',
    phone_number VARCHAR(50),
    status VARCHAR(30) DEFAULT 'in_progress',
    current_stage INTEGER DEFAULT 1,
    max_stage_reached INTEGER DEFAULT 1,
    outcome VARCHAR(50) DEFAULT 'not_logged',
    notes TEXT,
    prospect_words_stage5 TEXT,
    ai_summary TEXT,
    ai_sentiment VARCHAR(50),
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_stages table
CREATE TABLE IF NOT EXISTS call_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    action_tapped VARCHAR(100),
    action_label VARCHAR(150),
    prospect_words TEXT,
    ai_suggestion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

*Note: The backend also contains an automatic in-memory fallback preloaded with realistic seed calls from the transcripts, guaranteeing instant operation even before Supabase keys are configured.*

---

## ⚡ Backend REST Endpoints (Render)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | **Required Health Endpoint:** Returns backend uptime, service status, and LLM readiness |
| `GET` | `/api/stages` | Returns the 8 cold-call stages, transcript quotes, and quick-tap options |
| `POST` | `/api/calls` | Starts a new call session with prospect & company details |
| `POST` | `/api/calls/:id/stage` | Saves a stage tap, duration, and prospect verbatim text |
| `POST` | `/api/calls/:id/close` | Closes a call with final outcome, debrief notes, and duration |
| `GET` | `/api/calls` | Lists past calls with filtering by outcome, stage reached, and search |
| `GET` | `/api/calls/:id` | Returns complete call record with stage progression timeline |
| `POST` | `/api/llm/coach` | Calls Google Gemini / Groq for live 1-sentence coaching pivot |
| `POST` | `/api/llm/summarize` | Generates 2-sentence CRM debrief summary and next calendar action |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:5000` with the health endpoint active at `http://localhost:5000/health`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:3000`.

### 4. Optional Environment Variables (`backend/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-key
GEMINI_API_KEY=your-google-ai-studio-gemini-key
GROQ_API_KEY=your-groq-api-key
```

---

## 📦 Free Tier Deployment Guide

### Deploying Frontend to Vercel
1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repo.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add `VITE_BACKEND_URL` pointing to your Render backend URL (e.g., `https://meridian-caller.onrender.com`).
6. Click **Deploy**.

### Deploying Backend to Render
1. In [Render Dashboard](https://render.com), click **New Web Service** and connect this repository.
2. Set **Root Directory** to `backend`.
3. Set **Runtime** to `Node`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Set **Plan** to `Free`.
7. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(......)*
   - `SUPABASE_URL`: *(Your Supabase project URL)*
   - `SUPABASE_KEY`: *(Your Supabase key)*
8. Click **Create Web Service**. Render provides your public URL with the `/health` endpoint live.
