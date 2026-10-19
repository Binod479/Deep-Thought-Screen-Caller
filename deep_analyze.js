const fs = require('fs');
const path = require('path');

const transcriptsDir = path.join(__dirname, 'transcripts', 'cold-call-transcripts-100');
const indexPath = path.join(transcriptsDir, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// Stage definitions
const stages = [
  'Opening',
  'Purpose',
  'Permission',
  'Their business',
  'Their need',
  'Objection',
  'Next step',
  'Close'
];

// Let's analyze all 100 files
const stats = {
  totalCalls: 100,
  outcomes: {},
  dropOffStage: {},
  stageOccurrences: {},
  prospectPhrasesByStage: {
    1: [], // Opening
    2: [], // Purpose
    3: [], // Permission
    4: [], // Their business
    5: [], // Their need
    6: [], // Objection
    7: [], // Next step
    8: []  // Close
  },
  stage5Quotes: [],
  commonPatterns: []
};

for (let i = 1; i <= 100; i++) {
  const filename = `T${String(i).padStart(3, '0')}.txt`;
  const filePath = path.join(transcriptsDir, 'transcripts', filename);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let metadata = {};
  let turns = [];
  let isTurn = false;

  for (const line of lines) {
    if (line.startsWith('#')) continue;
    if (line.includes(': ') && !isTurn && !line.startsWith('CALLER:') && !line.startsWith('PROSPECT:') && !line.startsWith('RECEPTION:')) {
      const [k, ...v] = line.split(': ');
      metadata[k.trim()] = v.join(': ').trim();
    } else if (line.startsWith('CALLER:') || line.startsWith('PROSPECT:') || line.startsWith('RECEPTION:')) {
      isTurn = true;
      const speaker = line.startsWith('CALLER:') ? 'CALLER' : line.startsWith('PROSPECT:') ? 'PROSPECT' : 'RECEPTION';
      const text = line.replace(/^(CALLER|PROSPECT|RECEPTION):\s*/, '').trim();
      turns.push({ speaker, text });
    }
  }

  // Record outcome
  const outcome = metadata.outcome || 'not_logged';
  stats.outcomes[outcome] = (stats.outcomes[outcome] || 0) + 1;

  // Let's detect which stage the call reached based on content cues
  let reachedStage = 1;
  let hasObjection = false;
  let hasNextStep = false;
  let hasNeed = false;
  let hasBusiness = false;
  let hasPermission = false;
  let hasPurpose = false;

  turns.forEach((t, idx) => {
    const text = t.text.toLowerCase();
    if (t.speaker === 'PROSPECT') {
      // Stage 2 Purpose cues
      if (text.includes('regarding what') || text.includes('about what') || text.includes('what is this') || text.includes('who gave you') || text.includes('from where') || text.includes('what does')) {
        stats.prospectPhrasesByStage[2].push({ call: filename, text: t.text });
      }
      // Stage 3 Permission cues
      if (text.includes('call back') || text.includes('call me') || text.includes('meeting') || text.includes('busy') || text.includes('whatsapp') || text.includes('driving') || text.includes('tell me') || text.includes('go ahead') || text.includes('not right now') || text.includes('send it')) {
        stats.prospectPhrasesByStage[3].push({ call: filename, text: t.text });
      }
      // Stage 6 Objection cues
      if (text.includes('not interested') || text.includes('don\'t need') || text.includes('already have') || text.includes('not the right person') || text.includes('no need') || text.includes('don\'t think') || text.includes('policy')) {
        stats.prospectPhrasesByStage[6].push({ call: filename, text: t.text });
      }
    }
  });
}

console.log('Outcomes count:', stats.outcomes);
console.log('Sample Prospect Quotes Stage 2 (Purpose):', stats.prospectPhrasesByStage[2].slice(0, 10));
console.log('Sample Prospect Quotes Stage 3 (Permission):', stats.prospectPhrasesByStage[3].slice(0, 10));
console.log('Sample Prospect Quotes Stage 6 (Objection):', stats.prospectPhrasesByStage[6].slice(0, 10));
