const fs = require('fs');
const path = require('path');

const transcriptsDir = path.join(__dirname, 'transcripts', 'cold-call-transcripts-100');

// Let's find calls where Stage 5 happens (longer calls, positive outcomes, or discussing growth/operations)
const stage5Calls = [];

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

  // Look for prospect turns discussing business needs/challenges/growth/products/plant/operations
  turns.forEach((t, idx) => {
    if (t.speaker === 'PROSPECT') {
      const txt = t.text.toLowerCase();
      if (
        txt.includes('growth') ||
        txt.includes('bottleneck') ||
        txt.includes('capacity') ||
        txt.includes('margin') ||
        txt.includes('manufacturing') ||
        txt.includes('sales') ||
        txt.includes('market') ||
        txt.includes('expansion') ||
        txt.includes('struggle') ||
        txt.includes('challenge') ||
        txt.includes('problem') ||
        txt.includes('client') ||
        txt.includes('customers') ||
        txt.includes('competition') ||
        txt.includes('export') ||
        txt.includes('plant') ||
        txt.includes('revenue') ||
        txt.includes('hiring') ||
        txt.includes('team')
      ) {
        if (t.text.length > 30) {
          stage5Calls.push({
            call: filename,
            company: metadata.company,
            role: metadata.prospect_role,
            outcome: metadata.outcome,
            quote: t.text
          });
        }
      }
    }
  });
}

console.log(`Found ${stage5Calls.length} substantive prospect statements on needs/business:`);
stage5Calls.slice(0, 15).forEach((c, idx) => {
  console.log(`\n--- [${idx+1}] ${c.call} (${c.company} - ${c.role}) [Outcome: ${c.outcome}] ---`);
  console.log(`"${c.quote}"`);
});
