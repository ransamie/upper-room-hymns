const fs = require('fs');
const hymns = JSON.parse(fs.readFileSync('src/assets/hymns.json', 'utf8'));

const h66 = hymns.find(h => h.number === 66);
h66.lyrics = h66.lyrics.replace(/PRAISE TO THE[\s\S]+/, '').trim();

const h67 = hymns.find(h => h.number === 67);
h67.lyrics = `1. Praise to the Lord, the Almighty, the King of creation!
O my soul, praise Him, for He is thy health and salvation!
All ye who hear,
Now to His temple draw near;
Praise Him in glad adoration!

2. Praise to the Lord, who o'er all things so wondrously reigneth,
Shelters thee under His wings, yea, so gently sustaineth!
Hast thou not seen
How thy desires e'er have been
Granted in what He ordaineth?

3. Praise to the Lord, who doth prosper thy work and defend thee;
Surely His goodness and mercy here daily attend thee.
Ponder anew
What the Almighty can do,
If with His love He befriend thee.

4. Praise to the Lord, O let all that is in me adore Him!
All that hath life and breath, come now with praises before Him.
Let the Amen
Sound from His people again,
Gladly for aye we adore Him.`;

fs.writeFileSync('src/assets/hymns.json', JSON.stringify(hymns, null, 2));
console.log("Fixed hymns 66 and 67");
