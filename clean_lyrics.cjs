const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/assets/hymns.json', 'utf8'));

const cleaned = data.map(hymn => {
  let lyrics = hymn.lyrics;
  
  // Remove standalone numbers at the very beginning of the lyrics
  lyrics = lyrics.replace(/^\s*\d+\s*\n+/, '');
  
  // Remove standalone numbers in the middle (e.g. page numbers or leftover hymn numbers)
  lyrics = lyrics.replace(/\n\s*\d+\s*\n/g, '\n\n');
  
  // Ensure double newlines before stanzas (e.g., "1.", "2.")
  // We match a newline, optional spaces, and a digit followed by a dot.
  // We replace it with \n\n followed by the digit and dot.
  lyrics = lyrics.replace(/\n\s*(\d+\.)/g, '\n\n$1');
  
  // Normalize triple or more newlines to just double newlines
  lyrics = lyrics.replace(/\n{3,}/g, '\n\n');
  
  // Trim start and end
  lyrics = lyrics.trim();
  
  return {
    ...hymn,
    lyrics
  };
});

fs.writeFileSync('src/assets/hymns.json', JSON.stringify(cleaned, null, 2));
console.log('Cleaned lyrics formatting!');
