-- Schema for Meridian Growth Partners Cold Call Surface
-- Compatible with Supabase Free Tier (PostgreSQL)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Calls Table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_code VARCHAR(50), -- e.g. T001, CALL-20261019-01
    caller_name VARCHAR(100) NOT NULL DEFAULT 'Arjun (Meridian)',
    prospect_name VARCHAR(100) NOT NULL,
    prospect_role VARCHAR(150),
    company_name VARCHAR(150) NOT NULL,
    company_kind VARCHAR(100) DEFAULT 'mid-size private company',
    phone_number VARCHAR(50),
    status VARCHAR(30) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
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

-- 2. Call Stages Table (Records what happened at each stage of a call)
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

-- 3. Indexes for fast retrieval and query filtering
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_call_stages_call_id ON call_stages(call_id);
CREATE INDEX IF NOT EXISTS idx_call_stages_stage_number ON call_stages(stage_number);

-- 4. Enable Row Level Security (RLS) and allow public read/write for free-tier app
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_stages ENABLE ROW LEVEL SECURITY;

-- Allow anon public access (configured via Supabase anon key)
CREATE POLICY "Allow public read access to calls" ON calls FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to calls" ON calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to calls" ON calls FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to calls" ON calls FOR DELETE USING (true);

CREATE POLICY "Allow public read access to call_stages" ON call_stages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to call_stages" ON call_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to call_stages" ON call_stages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to call_stages" ON call_stages FOR DELETE USING (true);
