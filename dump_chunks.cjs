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
    if (i + 1 < lines.length && lines[i+1].trim().match(/^\d+$/)) skipNext = true;
    continue;
  }
  if (lines[i].includes('TABLE OF') || lines[i].includes('CONTENTS') || lines[i].match(/^Hymn\s+Hymn No\./)) continue;
  if (lines[i].trim() === '') continue;
  cleanLines.push(lines[i]);
}

const cleanText = cleanLines.join('\n');

// We split by 1.
// We use a regex that matches 1. at the start of a line (allowing spaces)
const chunks = cleanText.split(/^\s*1\.\s/gm);

console.log('Total chunks:', chunks.length); // 97

// We want to see if any chunk contains multiple hymns.
// We know hymns are usually separated by 2. 3. 4.
// If a chunk has no 2., it might be a single stanza hymn.
// If a chunk has multiple 2., it definitely contains multiple hymns.
for (let i = 0; i < chunks.length; i++) {
  const text = chunks[i];
  const twos = text.match(/^\s*2\.\s/gm);
  if (twos && twos.length > 1) {
    console.log(`Chunk ${i} has ${twos.length} '2.' markers!`);
    const s = text.split(/^\s*2\.\s/gm);
    for (let j = 0; j < s.length - 1; j++) {
        // the hymn boundary is somewhere in s[j]
        console.log(`  End of subchunk ${j}:`, s[j].slice(-150).replace(/\n/g, ' || '));
    }
  }
}
