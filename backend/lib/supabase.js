const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// In-memory fallback store
let memoryCalls = [];
try {
  const seedPath = path.join(__dirname, '..', '..', 'data', 'seed_calls.json');
  if (fs.existsSync(seedPath)) {
    memoryCalls = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load seed_calls.json into memory store:', e.message);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    isConfigured = true;
    console.log('✅ Supabase client initialized with URL:', supabaseUrl);
  } catch (err) {
    console.error('❌ Supabase initialization failed, falling back to memory store:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not provided in environment. Running with in-memory store (zero-setup mode).');
}

module.exports = {
  isConfigured: () => isConfigured,
  getSupabase: () => supabase,
  getMemoryStore: () => memoryCalls,
  addMemoryCall: (call) => {
    memoryCalls.unshift(call);
    return call;
  },
  updateMemoryCall: (id, updates) => {
    const idx = memoryCalls.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryCalls[idx] = { ...memoryCalls[idx], ...updates, updated_at: new Date().toISOString() };
      return memoryCalls[idx];
    }
    return null;
  },
  addMemoryStage: (callId, stage) => {
    const call = memoryCalls.find(c => c.id === callId);
    if (call) {
      if (!call.stages) call.stages = [];
      const stageRecord = {
        id: 'stg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        call_id: callId,
        created_at: new Date().toISOString(),
        ...stage
      };
      call.stages.push(stageRecord);
      call.current_stage = stage.stage_number;
      if (stage.stage_number > (call.max_stage_reached || 1)) {
        call.max_stage_reached = stage.stage_number;
      }
      return stageRecord;
    }
    return null;
  }
};
