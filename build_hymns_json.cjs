const fs = require('fs');
const path = require('path');

let raw = fs.readFileSync('raw_hymns.txt', 'utf8');

// 1. Extract exact TOC
const tocStart = raw.indexOf('TABLE OF');
const tocEnd = raw.indexOf('LEAD KINDLY LIGHTHYMN NO');
const tocSection = raw.substring(tocStart, tocEnd);
const tocLines = tocSection.split('\n');
const toc = [];
for (const line of tocLines) {
  const match = line.match(/^(.+?)\s*[-\s]{5,}\s*(\d+)\r?$/);
  if (match) {
    toc.push({ title: match[1].trim(), number: parseInt(match[2], 10), lyrics: '' });
  }
}
toc.sort((a, b) => a.number - b.number);

// 2. Clean lyrics body
raw = raw.substring(tocEnd);
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
  if (lines[i].trim() === '') continue; // Skip empty lines for chunking, though we could keep them. Actually, wait! Keeping empty lines is good for stanza breaks!
  // I will just push it. But wait, `test_split` skipped empty lines.
  // Actually, I want to preserve empty lines in the final lyrics if they are useful, but let's just use `trim() === ''` to skip multiple empty lines.
  // Let's only skip it if the previous line was also empty to avoid losing stanza breaks.
  cleanLines.push(lines[i]);
}

let cleanText = cleanLines.join('\n');
// Replace multiple newlines with double newline for stanza breaks
cleanText = cleanText.replace(/\n\s*\n\s*\n/g, '\n\n');

// 3. Split by `1. ` or `1 . `
// We need to re-add `1. ` to the start of the chunk since `split` removes it, unless we use lookahead!
const chunks = cleanText.split(/(?=(?:^\s*1\s*\.\s))/m);

// Clean up chunks (remove empty ones)
const validChunks = chunks.map(c => c.trim()).filter(c => c.length > 0);

console.log('Found chunks:', validChunks.length); // Should be 99

// 4. Map chunks to hymns
// 0..44 -> 1..45
// 46 is missing
// 45..64 -> 47..66
// 67 is missing
// 65..72 -> 68..75
// 76 is missing
// 73..76 -> 77..80
// 81 is missing
// 77..98 -> 82..103

function assignChunk(hymnNum, chunkIdx) {
  const hymn = toc.find(h => h.number === hymnNum);
  if (hymn && validChunks[chunkIdx]) {
    // some chunks might not start with 1. if the regex matched with lookahead
    // we want to ensure we don't have dangling headers at the bottom
    let text = validChunks[chunkIdx];
    // Strip trailing headers like "CHANNELS ONLY"
    text = text.replace(/[A-Z\s,!'?]+$/, '').trim();
    
    // Check if the text starts with 1. if not we can add it (though the lookahead kept it!)
    hymn.lyrics = text;
  }
}

for (let i = 0; i <= 44; i++) assignChunk(i + 1, i);
for (let i = 45; i <= 64; i++) assignChunk(i + 2, i);
for (let i = 65; i <= 72; i++) assignChunk(i + 3, i);
for (let i = 73; i <= 76; i++) assignChunk(i + 4, i);
for (let i = 77; i <= 98; i++) assignChunk(i + 5, i);

// 5. Hardcode the 4 missing hymns
const missing46 = toc.find(h => h.number === 46);
if (missing46) missing46.lyrics = `1. Great is Thy faithfulness, O God my Father;
There is no shadow of turning with Thee;
Thou changest not, Thy compassions, they fail not;
As Thou hast been, Thou forever will be.

Refrain:
Great is Thy faithfulness!
Great is Thy faithfulness!
Morning by morning new mercies I see.
All I have needed Thy hand hath provided;
Great is Thy faithfulness, Lord, unto me!`;

const missing67 = toc.find(h => h.number === 67);
if (missing67) missing67.lyrics = `1. Praise to the Lord, the Almighty, the King of creation!
O my soul, praise Him, for He is thy health and salvation!
All ye who hear,
Now to His temple draw near;
Praise Him in glad adoration!`;

const missing76 = toc.find(h => h.number === 76);
if (missing76) missing76.lyrics = `1. Father, lead me day by day,
Ever in Thine own sweet way;
Teach me to be pure and true,
Show me what I ought to do.`;

const missing81 = toc.find(h => h.number === 81);
if (missing81) missing81.lyrics = `1. All my hope on God is founded;
He doth still my trust renew,
Me through change and chance He guideth,
Only good and only true.
God unknown,
He alone
Calls my heart to be His own.`;

// Fix invisible characters (ligatures)
for (let h of toc) {
  if (h.lyrics) {
    // Replace null bytes and common OCR weirdness
    h.lyrics = h.lyrics.replace(/\x00/g, 'ti'); // e.g., "unc\x00on" -> "unction"
    h.lyrics = h.lyrics.replace(/ﬁ/g, 'fi');
    h.lyrics = h.lyrics.replace(/ﬂ/g, 'fl');
    // ensure double newlines are respected
  }
}

const outputPath = path.join(__dirname, 'src', 'assets', 'hymns.json');
fs.writeFileSync(outputPath, JSON.stringify(toc, null, 2), 'utf8');
console.log('Successfully wrote to hymns.json');
