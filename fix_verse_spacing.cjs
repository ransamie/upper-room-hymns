const fs = require('fs');
const path = require('path');

const hymnsPath = path.join(__dirname, 'src', 'assets', 'hymns.json');
let hymns = require(hymnsPath);

hymns = hymns.map((hymn, index) => {
    let lyrics = hymn.lyrics;
    
    // 1. Fix strange character encoding for apostrophes
    lyrics = lyrics.replace(/\?T/g, "'");
    
    // 2. Fix paragraph spacing
    // Add \n\n before verses (e.g. 2.) and Chorus/Refrain if there isn't one already.
    // We replace 1 or more newlines before the verse marker with exactly two newlines.
    lyrics = lyrics.replace(/\r?\n+([1-9][0-9]*\.|Chorus:|Refrain:)/gi, "\n\n$1");

    // 3. Title Bug Fix - Remove trailing next hymn titles
    const nextHymnNumber = hymn.number + 1;
    // Match uppercase letters, spaces, quotes, newlines ending with the next hymn number
    const strayNumberRegex = new RegExp(`\\r?\\n+[A-Z\\s‘'’\\-,]+?${nextHymnNumber}$`);
    lyrics = lyrics.replace(strayNumberRegex, '');
    
    // Also check for the exact next title (case insensitive) at the end of the text
    if (index < hymns.length - 1) {
        const nextTitle = hymns[index + 1].title.trim();
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const titleRegex = new RegExp(`\\r?\\n+${escapeRegExp(nextTitle)}$`, 'i');
        lyrics = lyrics.replace(titleRegex, '');
    }

    // Sometimes the trailing title ends up capitalized but without a number
    // Let's remove any trailing text that is ALL UPPERCASE and separated from the main text by a newline
    lyrics = lyrics.replace(/\r?\n+([A-Z\s‘'’\-,]+)$/, (match, p1) => {
        // If it's short enough (e.g. < 100 chars), it's probably a stray title
        if (p1.length < 100) {
            return '';
        }
        return match;
    });

    return {
        ...hymn,
        lyrics: lyrics.trim()
    };
});

fs.writeFileSync(hymnsPath, JSON.stringify(hymns, null, 2), 'utf-8');
console.log('Fixed paragraph spacing and title bugs in hymns.json!');
