const fs = require('fs');

let raw = fs.readFileSync('raw_hymns.txt', 'utf8');

raw = raw.substring(raw.indexOf('LEAD KINDLY LIGHTHYMN NO'));

// Strip PAGE markers
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
  if (lines[i].trim() === '') continue;
  cleanLines.push(lines[i]);
}

let currentHymn = [];
const hymns = [];

const startMarkers = [
  /^1\.\s/,
  /^How I praise Thee, precious Saviour/i, // Hymn 2
  /^Humble Thyself to\s+walk with God/i, // Humble Thyself
  /^Give me oil in my lamp/i, 
  /^Breathe on me, Breath of God/i,
  /^Burn in me, Fire of God/i,
  /^Grace! Thy grace alone/i,
  /^I have prepared my heart for You/i,
  /^Holy words, long preserved/i,
  /^I'm pressing on the upward way/i,
  /^When strong tempta ons surround me/i,
  /^The fullness of the Godhead bodily/i,
  /^Faith of our fathers, living s ll/i,
  /^We praise Thee, O God!/i,
  /^Oh Lord, my God, when I in awesome/i,
  /^My God, how wonderful Thou art/i,
  /^My faith has found a res ng place/i,
  /^Jesus only is our message/i,
  /^Fairest of all the earth beside/i,
  /^Thy Kingdom come, O God/i,
  /^In Jesus Christ I am complete/i,
  /^Who has the power to raise the dead/i,
  /^Whither, pilgrims, are you going/i,
  /^Immortal, invisible, God only wise/i,
  /^Nothing between my soul and my Saviour/i,
  /^'Tis so sweet to trust in Jesus/i,
  /^Where He may lead me I will go/i,
  /^While passing thro' this world of sin/i,
  /^There is a name I love to hear/i,
  /^I must tell Jesus all of my trials/i,
  /^As the deer panteth for the water/i,
  /^Lord, the light of Your love is shining/i,
  /^Come, Holy Spirit, I need Thee/i,
  /^‘Though days are long, o\s*ﬁlled with cares/i,
  /^O to be like Thee! Blessed Redeemer/i,
  /^Years I spent in vanity and pride/i,
  /^On a hill far away stood an old rugged/i,
  /^Colours of day dawn into the mind/i,
  /^If your life, in days gone by/i,
  /^For I'm building a people of power/i,
  /^Have Thine Own way, Lord!/i,
  /^Enlarge my heart O Lord/i,
  /^Jesus, Master, Whose I am/i,
  /^Fight the good ﬁght with all thy might/i,
  /^Courage, brother, do not stumble/i,
  /^Thy way, not mine, O Lord/i,
  /^O perfect Life of love!/i,
  /^Lord Jesus, think on me/i,
  /^Jesus, these eyes have never seen/i,
  /^Thee will I love, my Strength, my Tower/i,
  /^My God, I love Thee; not because/i,
  /^Jesus! Name of wondrous love!/i,
  /^As with gladness, men of old/i,
  /^And can it be, that I should gain/i,
  /^Jesus, we are far away/i,
  /^Rise up, O men of God!/i,
  /^Shine Thou upon us, Lord/i,
  /^Round the Lord in glory seated/i,
  /^Glory be to God the Father/i,
  /^O, what can li le hands do/i,
  /^O Perfect Love, all human thoughts/i,
  /^God is always near me/i,
  /^Do no sinful ac on/i,
  /^Majesty! Worship His majesty/i,
  /^Come, we that love the Lord/i,
  /^Why should I feel discouraged/i,
  /^I was sinking deep in sin/i,
  /^Ere you le\s*your room this morning/i,
  /^We come again, dear Saviour/i,
  /^The ﬁrst Nowell, the angel did say/i,
  /^Be Thou my vision, O Lord of my heart/i,
  /^While shepherds kept their watching/i,
  /^Through the love of God our Saviour/i,
  /^In the warfare that is raging/i,
  /^Mokop Uyo odohode/i,
  /^Afo 'modot itoro/i,
  /^Ndot enyin ke Abasi/i,
  /^Ufok Abasi osong/i,
  /^k'ima Andinyanga y'Ete/i,
  /^Se Obon e e k’ubon/i
];

for (let i = 0; i < cleanLines.length; i++) {
  const line = cleanLines[i].trim();
  let isStart = false;
  for (const marker of startMarkers) {
    if (line.match(marker)) {
      isStart = true;
      break;
    }
  }
  
  if (isStart && currentHymn.length > 0) {
    hymns.push(currentHymn);
    currentHymn = [];
  }
  currentHymn.push(line);
}
if (currentHymn.length > 0) {
  hymns.push(currentHymn);
}

console.log('Total hymns extracted:', hymns.length);
if (hymns.length !== 103) {
   // Let's print the first lines of the hymns we DID extract so we can see what's wrong
   hymns.forEach((h, idx) => console.log(idx, h[0]));
}
