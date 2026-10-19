const express = require('express');
const router = express.Router();
const { generateCoachPivot, generateCallSummary } = require('../lib/llm_client');

// POST /api/llm/coach
// Instant real-time coaching for live caller
router.post('/coach', async (req, res) => {
  try {
    const {
      stageNumber,
      stageName,
      actionTapped,
      prospectWords,
      companyName,
      prospectName,
      prospectRole,
      provider
    } = req.body;

    const customApiKey = req.headers['x-gemini-key'] || req.headers['x-groq-key'] || req.body.apiKey;

    const result = await generateCoachPivot({
      stageNumber: Number(stageNumber) || 2,
      stageName: stageName || 'Current Stage',
      actionTapped,
      prospectWords,
      companyName,
      prospectName,
      prospectRole,
      customApiKey,
      provider
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Coach endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/llm/summarize
// Call summary debrief generator
router.post('/summarize', async (req, res) => {
  try {
    const { call, stages, provider } = req.body;
    const customApiKey = req.headers['x-gemini-key'] || req.headers['x-groq-key'] || req.body.apiKey;

    const result = await generateCallSummary({
      call: call || {},
      stages: stages || [],
      customApiKey,
      provider
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Summarize endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
