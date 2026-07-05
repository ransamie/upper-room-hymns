const fs = require('fs');

const raw = fs.readFileSync('raw_hymns.txt', 'utf8');
const tocStart = raw.indexOf('TABLE OF');
const tocEnd = raw.indexOf('LEAD KINDLY LIGHT');
const tocSection = raw.substring(tocStart, tocEnd);

const tocLines = tocSection.split('\n');
const toc = [];

for (const line of tocLines) {
  // match Title ----- Number
  // There could be multiple dashes.
  const match = line.match(/^(.+?)\s*[-\s]{5,}\s*(\d+)\r?$/);
  if (match) {
    let title = match[1].trim();
    const num = parseInt(match[2], 10);
    // There might be some page markers inside the title or something, let's just clean it
    toc.push({ num, title });
  }
}

toc.sort((a, b) => a.num - b.num);
console.log(`Extracted ${toc.length} hymns from TOC`);
if (toc.length > 0) {
    console.log(toc[0]);
    console.log(toc[14]);
    console.log(toc[46]);
    console.log(toc[toc.length - 1]);
}
