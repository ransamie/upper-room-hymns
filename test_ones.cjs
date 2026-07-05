const fs = require('fs');
let raw = fs.readFileSync('raw_hymns.txt', 'utf8');

raw = raw.substring(raw.indexOf('LEAD KINDLY LIGHTHYMN NO'));

// Strip PAGE markers
raw = raw.replace(/---\s*PAGE\s*\d+\s*---/g, '');

// Strip HYMN NO markers. They look like [TITLE]HYMN NO \n [NUMBER] or just HYMN NO \n [NUMBER]
// We can just strip anything containing HYMN NO and the next line if it's a number.
const lines = raw.split('\n');
const cleanLines = [];
let skipNext = false;
for (let i = 0; i < lines.length; i++) {
  if (skipNext) {
    skipNext = false;
    continue;
  }
  if (lines[i].includes('HYMN NO')) {
    // Check if next line is just a number
    if (i + 1 < lines.length && lines[i+1].trim().match(/^\d+$/)) {
      skipNext = true;
    }
    continue; // Skip this line
  }
  cleanLines.push(lines[i]);
}

const cleanText = cleanLines.join('\n');
// Now let's count 1. 
const ones = cleanText.match(/^1\.\s/gm);
console.log('Count of 1. :', ones ? ones.length : 0);

// Print the first few lines of the clean text to see what's happening
// console.log(cleanText.substring(0, 1000));
