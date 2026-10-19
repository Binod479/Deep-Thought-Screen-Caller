const fs = require('fs');
const path = require('path');

const transcriptsDir = path.join(__dirname, 'transcripts', 'cold-call-transcripts-100');
const indexPath = path.join(transcriptsDir, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

console.log(`Total calls indexed: ${index.length}`);

// Count outcomes
const outcomeCounts = {};
index.forEach(item => {
  outcomeCounts[item.outcome] = (outcomeCounts[item.outcome] || 0) + 1;
});
console.log('Outcomes:', JSON.stringify(outcomeCounts, null, 2));

// Count roles and company types
const roleCounts = {};
const companyKinds = {};
index.forEach(item => {
  roleCounts[item.prospect_role] = (roleCounts[item.prospect_role] || 0) + 1;
  companyKinds[item.company_kind] = (companyKinds[item.company_kind] || 0) + 1;
});
console.log('Roles:', JSON.stringify(roleCounts, null, 2));
console.log('Company kinds:', JSON.stringify(companyKinds, null, 2));

// Read sample transcripts to see how callers and prospects speak
const samples = ['T001.txt', 'T005.txt', 'T012.txt', 'T025.txt', 'T050.txt', 'T075.txt', 'T100.txt'];
samples.forEach(file => {
  const filePath = path.join(transcriptsDir, 'transcripts', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n=================== ${file} ===================`);
    console.log(content.split('\n').slice(0, 25).join('\n'));
  }
});
