const fs = require('fs');
let raw = fs.readFileSync('raw_hymns.txt', 'utf8');

raw = raw.substring(raw.indexOf('LEAD KINDLY LIGHTHYMN NO'));
raw = raw.replace(/---\s*PAGE\s*\d+\s*---/g, '');

const lines = raw.split('\n');
const cleanLines = [];
let skipNext = false;
for (let i = 0; i < lines.length; i++) {
  if (skipNext) {
    skipNext = false;
    continue;
  }
  if (lines[i].includes('HYMN NO')) {
    if (i + 1 < lines.length && lines[i+1].trim().match(/^\d+$/)) {
      skipNext = true;
    }
    continue;
  }
  // also strip 'TABLE OF CONTENTS' if it got injected
  if (lines[i].includes('TABLE OF') || lines[i].includes('CONTENTS') || lines[i].match(/^Hymn\s+Hymn No\./)) {
      continue;
  }
  cleanLines.push(lines[i]);
}

const cleanText = cleanLines.join('\n');
const chunks = cleanText.split(/^1\.\s/gm);

console.log('Total chunks (should be 97 if 96 1.s):', chunks.length);

for (let i = 0; i < chunks.length; i++) {
  const twos = chunks[i].match(/^2\.\s/gm);
  if (twos && twos.length > 1) {
    console.log(`\nChunk ${i} has ${twos.length} '2.' markers! It contains multiple hymns.`);
    console.log('Snippet of chunk:', chunks[i].substring(0, 300).replace(/\n/g, ' || '));
    // Let's find where the second 2. is, and print the text around it to identify the missing 1.
    const split2 = chunks[i].split(/^2\.\s/gm);
    console.log('Text before the SECOND 2.:', split2[1].slice(-200).replace(/\n/g, ' || '));
  }
}
