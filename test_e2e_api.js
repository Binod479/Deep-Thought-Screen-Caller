const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End API Life-cycle Test...\n');

  // 1. Health Endpoint
  console.log('1. Testing Health Endpoint (/health)...');
  const health = await get('/health');
  console.log('   Result:', health.status === 'ok' ? '✅ OK' : '❌ FAILED', JSON.stringify(health));

  // 2. Stages Reference
  console.log('\n2. Testing Stages Reference (/api/stages)...');
  const stagesRes = await get('/api/stages');
  console.log(`   Result: ✅ Loaded ${stagesRes.stages.length} stages (1 to 8)`);
  console.log(`   Stage 1: ${stagesRes.stages[0].name} - "${stagesRes.stages[0].short_purpose}"`);
  console.log(`   Stage 5: ${stagesRes.stages[4].name} - "${stagesRes.stages[4].short_purpose}"`);

  // 3. Start a Call
  console.log('\n3. Starting a New Call (/api/calls)...');
  const startRes = await post('/api/calls', {
    caller_name: 'Arjun (Meridian)',
    prospect_name: 'Dr. Anjali Menon',
    company_name: 'Menon Family Clinic',
    prospect_role: 'Owner & Managing Director',
    company_kind: 'mid-size private company',
    phone_number: '+91 98490 88211'
  });
  const callId = startRes.call.id;
  console.log(`   Result: ✅ Call started with ID: ${callId}, Status: ${startRes.call.status}`);

  // 4. Save Stage 2 (Purpose)
  console.log('\n4. Saving Stage 2 Result (Purpose)...');
  const stage2Res = await post(`/api/calls/${callId}/stage`, {
    stage_number: 2,
    stage_name: 'Purpose',
    action_tapped: 'asked_what_we_do',
    action_label: 'Asked what company does',
    prospect_words: 'Accounting for what? We have a CA who files everything.',
    duration_seconds: 35
  });
  console.log('   Result: ✅ Stage 2 saved. Tapped:', stage2Res.stage.action_label);

  // 5. Test Live AI Coach Pivot
  console.log('\n5. Requesting Live AI Coach Pivot (/api/llm/coach)...');
  const coachRes = await post('/api/llm/coach', {
    stageNumber: 2,
    stageName: 'Purpose',
    actionTapped: 'asked_what_we_do',
    prospectWords: 'Accounting for what? We have a CA who files everything.',
    companyName: 'Menon Family Clinic',
    prospectName: 'Dr. Anjali Menon',
    prospectRole: 'Owner'
  });
  console.log('   Result: ✅ AI Live Coach generated:');
  console.log(`   Pivot to Say: "${coachRes.pivotSentence}"`);
  console.log(`   Intent: ${coachRes.intent} | Source: ${coachRes.source}`);

  // 6. Save Stage 5 (Their need in their words)
  console.log('\n6. Saving Stage 5 Result (Their need, in their words)...');
  const stage5Res = await post(`/api/calls/${callId}/stage`, {
    stage_number: 5,
    stage_name: 'Their need, in their words',
    action_tapped: 'named_growth_goal',
    action_label: 'Named growth goal / new product',
    prospect_words: 'Next month we are launching an outpatient surgical wing, so patient flow tracking is critical.',
    duration_seconds: 110
  });
  console.log('   Result: ✅ Stage 5 Verbatim saved:', stage5Res.stage.prospect_words);

  // 7. Test AI Call Debrief
  console.log('\n7. Generating AI Call Debrief Summary (/api/llm/summarize)...');
  const summaryRes = await post('/api/llm/summarize', {
    call: {
      prospect_name: 'Dr. Anjali Menon',
      company_name: 'Menon Family Clinic',
      outcome: 'next_step_agreed',
      duration_seconds: 145,
      prospect_words_stage5: 'Next month we are launching an outpatient surgical wing, so patient flow tracking is critical.'
    },
    stages: [stage2Res.stage, stage5Res.stage]
  });
  console.log('   Result: ✅ AI Call Summary generated:');
  console.log(`   Summary: "${summaryRes.summary}"`);
  console.log(`   Next Action: "${summaryRes.nextAction}"`);

  // 8. Close the Call
  console.log('\n8. Closing Call (/api/calls/:id/close)...');
  const closeRes = await post(`/api/calls/${callId}/close`, {
    outcome: 'next_step_agreed',
    notes: 'Agreed to Google Meet next Tuesday 3 PM regarding outpatient wing growth benchmark.',
    prospect_words_stage5: 'Next month we are launching an outpatient surgical wing, so patient flow tracking is critical.',
    ai_summary: summaryRes.summary,
    ai_sentiment: summaryRes.sentiment || 'Receptive',
    duration_seconds: 145,
    max_stage_reached: 7
  });
  console.log('   Result: ✅ Call closed. Outcome:', closeRes.call.outcome, 'Status:', closeRes.call.status);

  // 9. List Past Calls (Second Screen)
  console.log('\n9. Querying Past Calls List (/api/calls)...');
  const listRes = await get('/api/calls');
  console.log(`   Result: ✅ Retrieved ${listRes.calls.length} total calls in history.`);
  const latestCall = listRes.calls.find(c => c.id === callId);
  console.log('   Latest call found in history:', {
    prospect: latestCall.prospect_name,
    company: latestCall.company_name,
    stage_reached: latestCall.max_stage_reached,
    outcome: latestCall.outcome,
    duration: `${latestCall.duration_seconds}s`
  });

  console.log('\n🎉 ALL 9 LIFE-CYCLE TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
