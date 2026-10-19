const fs = require('fs');
const path = require('path');

const transcriptsDir = path.join(__dirname, 'transcripts', 'cold-call-transcripts-100');
const indexPath = path.join(transcriptsDir, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

const successfulCalls = index.filter(c => ['next_step_agreed', 'agreed_to_receive_report', 'interested'].includes(c.outcome));
console.log(`Found ${successfulCalls.length} successful/progressed calls.`);

successfulCalls.slice(0, 6).forEach(c => {
  const filePath = path.join(transcriptsDir, 'transcripts', `${c.id}.txt`);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`\n=================== ${c.id} (${c.company} | ${c.prospect_role} | ${c.outcome}) ===================`);
  const lines = content.split('\n');
  const turns = lines.filter(l => l.startsWith('CALLER:') || l.startsWith('PROSPECT:') || l.startsWith('RECEPTION:'));
  console.log(turns.slice(0, 16).join('\n'));
});
