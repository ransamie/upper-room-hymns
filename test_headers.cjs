const fs = require('fs');

let raw = fs.readFileSync('raw_hymns.txt', 'utf8');

// 1. Extract TOC
const tocStart = raw.indexOf('TABLE OF');
const tocEnd = raw.indexOf('LEAD KINDLY LIGHTHYMN NO');
const tocSection = raw.substring(tocStart, tocEnd);
const tocLines = tocSection.split('\n');
const toc = [];
for (const line of tocLines) {
  const match = line.match(/^(.+?)\s*[-\s]{5,}\s*(\d+)\r?$/);
  if (match) {
    toc.push({ title: match[1].trim(), num: parseInt(match[2], 10) });
  }
}
toc.sort((a, b) => a.num - b.num);

// 2. Find headers in body
let body = raw.substring(tocEnd);

// A header is usually [TITLE]HYMN NO \n [NUMBER] or [TITLE]\nHYMN NO \n [NUMBER]
// We can find all occurrences of "HYMN NO"
const headerMatches = [...body.matchAll(/HYMN NO.*?[\r\n]*.*?(\d+)/g)];

console.log('Found HYMN NO matches:', headerMatches.length);

// We need to map each HYMN NO to its actual hymn number
const headers = [];
for (const m of headerMatches) {
    const num = parseInt(m[1], 10);
    if (num >= 1 && num <= 103) {
        headers.push({ num, index: m.index, length: m[0].length, fullMatch: m[0] });
    }
}

console.log('Valid headers found:', headers.length);
if (headers.length < 103) {
    console.log('Missing some headers!');
}
