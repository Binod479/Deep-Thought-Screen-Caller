const express = require('express');
const router = express.Router();
const supabaseHelper = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

// Load stage reference
let stageReference = [];
try {
  const refPath = path.join(__dirname, '..', '..', 'stage_reference.json');
  if (fs.existsSync(refPath)) {
    stageReference = JSON.parse(fs.readFileSync(refPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not read stage_reference.json:', e.message);
}

// 1. GET /api/stages - returns all 8 stages with transcript-backed data
router.get('/stages', (req, res) => {
  res.json({
    success: true,
    stages: stageReference
  });
});

// 2. POST /api/calls - start a call
router.post('/calls', async (req, res) => {
  try {
    const {
      caller_name = 'Arjun (Meridian)',
      prospect_name = 'Prospect',
      company_name = 'Target Enterprise',
      prospect_role = 'Director / Owner',
      company_kind = 'mid-size private company',
      phone_number = ''
    } = req.body;

    const newCall = {
      id: 'call_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      call_code: 'CALL-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      caller_name,
      prospect_name,
      company_name,
      prospect_role,
      company_kind,
      phone_number,
      status: 'in_progress',
      current_stage: 1,
      max_stage_reached: 1,
      outcome: 'not_logged',
      notes: '',
      prospect_words_stage5: '',
      ai_summary: '',
      ai_sentiment: 'Evaluating',
      duration_seconds: 0,
      started_at: new Date().toISOString(),
      ended_at: null,
      created_at: new Date().toISOString(),
      stages: []
    };

    if (supabaseHelper.isConfigured()) {
      const supabase = supabaseHelper.getSupabase();
      const { data, error } = await supabase
        .from('calls')
        .insert([{
          caller_name: newCall.caller_name,
          prospect_name: newCall.prospect_name,
          company_name: newCall.company_name,
          prospect_role: newCall.prospect_role,
          company_kind: newCall.company_kind,
          phone_number: newCall.phone_number,
          status: 'in_progress',
          current_stage: 1,
          max_stage_reached: 1,
          outcome: 'not_logged'
        }])
        .select()
        .single();

      if (!error && data) {
        newCall.id = data.id;
        newCall.created_at = data.created_at;
      } else {
        console.warn('Supabase insert failed, using memory store:', error?.message);
      }
    }

    supabaseHelper.addMemoryCall(newCall);

    res.status(201).json({
      success: true,
      call: newCall
    });
  } catch (err) {
    console.error('Error starting call:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/calls/:id/stage - save a stage result
router.post('/calls/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stage_number,
      stage_name,
      action_tapped,
      action_label,
      prospect_words = '',
      ai_suggestion = '',
      duration_seconds = 0
    } = req.body;

    if (!stage_number) {
      return res.status(400).json({ success: false, error: 'stage_number is required' });
    }

    const stageData = {
      stage_number: Number(stage_number),
      stage_name: stage_name || `Stage ${stage_number}`,
      action_tapped: action_tapped || '',
      action_label: action_label || action_tapped || '',
      prospect_words,
      ai_suggestion,
      duration_seconds: Number(duration_seconds) || 0
    };

    // Save in Supabase if configured
    if (supabaseHelper.isConfigured()) {
      const supabase = supabaseHelper.getSupabase();
      await supabase.from('call_stages').insert([{
        call_id: id,
        ...stageData
      }]);

      const updates = {
        current_stage: stageData.stage_number,
        updated_at: new Date().toISOString()
      };
      if (stageData.stage_number === 5 && prospect_words) {
        updates.prospect_words_stage5 = prospect_words;
      }
      await supabase.from('calls').update(updates).eq('id', id);
    }

    // Always update memory store
    const savedStage = supabaseHelper.addMemoryStage(id, stageData);
    if (stageData.stage_number === 5 && prospect_words) {
      supabaseHelper.updateMemoryCall(id, { prospect_words_stage5: prospect_words });
    }

    res.json({
      success: true,
      stage: savedStage || stageData
    });
  } catch (err) {
    console.error('Error saving stage result:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/calls/:id/close - close a call
router.post('/calls/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      outcome = 'not_logged',
      notes = '',
      prospect_words_stage5 = '',
      ai_summary = '',
      ai_sentiment = '',
      duration_seconds = 0,
      max_stage_reached = 1
    } = req.body;

    const closeUpdates = {
      status: 'completed',
      outcome,
      notes,
      duration_seconds: Number(duration_seconds) || 0,
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (prospect_words_stage5) closeUpdates.prospect_words_stage5 = prospect_words_stage5;
    if (ai_summary) closeUpdates.ai_summary = ai_summary;
    if (ai_sentiment) closeUpdates.ai_sentiment = ai_sentiment;
    if (max_stage_reached) closeUpdates.max_stage_reached = Number(max_stage_reached);

    if (supabaseHelper.isConfigured()) {
      const supabase = supabaseHelper.getSupabase();
      await supabase.from('calls').update(closeUpdates).eq('id', id);
    }

    const updated = supabaseHelper.updateMemoryCall(id, closeUpdates);

    res.json({
      success: true,
      call: updated
    });
  } catch (err) {
    console.error('Error closing call:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET /api/calls - list past calls
router.get('/calls', async (req, res) => {
  try {
    const { status, outcome, search, stage } = req.query;

    let callsList = [];

    if (supabaseHelper.isConfigured()) {
      const supabase = supabaseHelper.getSupabase();
      let query = supabase.from('calls').select('*, stages:call_stages(*)').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (outcome) query = query.eq('outcome', outcome);
      
      const { data, error } = await query;
      if (!error && data) {
        callsList = data;
      } else {
        callsList = supabaseHelper.getMemoryStore();
      }
    } else {
      callsList = supabaseHelper.getMemoryStore();
    }

    // Apply filtering
    if (status) {
      callsList = callsList.filter(c => c.status === status);
    }
    if (outcome) {
      callsList = callsList.filter(c => c.outcome === outcome);
    }
    if (stage) {
      callsList = callsList.filter(c => String(c.max_stage_reached) === String(stage) || String(c.current_stage) === String(stage));
    }
    if (search) {
      const q = search.toLowerCase();
      callsList = callsList.filter(c => 
        (c.prospect_name && c.prospect_name.toLowerCase().includes(q)) ||
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.caller_name && c.caller_name.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      total: callsList.length,
      calls: callsList
    });
  } catch (err) {
    console.error('Error listing calls:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET /api/calls/:id - get single call details with all stages
router.get('/calls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let call = null;

    if (supabaseHelper.isConfigured()) {
      const supabase = supabaseHelper.getSupabase();
      const { data } = await supabase.from('calls').select('*, stages:call_stages(*)').eq('id', id).single();
      if (data) call = data;
    }

    if (!call) {
      call = supabaseHelper.getMemoryStore().find(c => c.id === id);
    }

    if (!call) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }

    res.json({
      success: true,
      call
    });
  } catch (err) {
    console.error('Error fetching call:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
