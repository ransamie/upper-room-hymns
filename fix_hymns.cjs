const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/assets/hymns.json', 'utf8'));

// The mapping is mostly ti, tt, or ft. Let's create a map for words.
const replacements = {
  '\x00on': 'tion', 'a\x00er': 'after', 'a\x00rac': 'attrac', 'ac\x00on': 'action',
  'accep\x00ng': 'accepting', 'acclama\x00on': 'acclamation', 'adora\x00on': 'adoration',
  'anoin\x00ng': 'anointing', 'ba\x00le': 'battle', 'bap\x00zed': 'baptized',
  'be\x00er': 'better', 'beau\x00ful': 'beautiful', 'bi\x00er': 'bitter',
  'boas\x00ngs': 'boastings', 'boun\x00ful': 'bountiful', 'cap\x00ve': 'captive',
  'celes\x00al': 'celestial', 'chan\x00ng': 'chanting', 'chris\x00an': 'christian',
  'condemna\x00on': 'condemnation', 'condi\x00ons': 'conditions', 'contri\x00on': 'contrition',
  'crea\x00on': 'creation', 'direc\x00on': 'direction', 'doub\x00ul': 'doubtful',
  'e\x00be': 'etibe', 'e\x00e': 'etie', 'e\x00ene': 'etiene', 'e\x00ened': 'etiened',
  'emp\x00ed': 'emptied', 'everlas\x00ng': 'everlasting', 'fac\x00on': 'faction',
  'fain\x00ng': 'fainting', 'fe\x00ers': 'fetters', 'forgo\x00en': 'forgotten',
  'fran\x00c': 'frantic', 'frui\x00ul': 'fruitful', 'gen\x00les': 'gentiles',
  'gi\x00s': 'gifts', 'gran\x00ng': 'granting', 'hear\x00elt': 'heartfelt',
  'i\x00e': 'itie', 'incanta\x00ons': 'incantations', 'jus\x00ce': 'justice',
  'le\x00ers': 'letters', 'li\x00ed': 'lifted', 'li\x00le': 'little',
  'life\x00me': 'lifetime', 'lo\x00y': 'lofty', 'ma\x00er': 'matter',
  'mbuo\x00dem': 'mbuotidem', 'mee\x00ng': 'meeting', 'na\x00on': 'nation',
  'na\x00ons': 'nations', 'nke\x00en': 'nketien', 'nke\x00ene': 'nketiene',
  'nsa\x00tong': 'nsatitong', 'o\x00m': 'oftim', 'ostenta\x00on': 'ostentation',
  'pa\x00ent': 'patient', 'pan\x00ng': 'panting', 'peniten\x00al': 'penitential',
  'po\x00er': 'potter', 'por\x00on': 'portion', 'protec\x00ng': 'protecting',
  'providen\x00al': 'providential', 'res\x00ng': 'resting', 'resis\x00ng': 'resisting',
  's\x00ll': 'still', 'sa\x00ate': 'satiate', 'sa\x00sfy': 'satisfy',
  'salva\x00on': 'salvation', 'sanc\x00fy': 'sanctify', 'sca\x00ered': 'scattered',
  'se\x00ng': 'setting', 'shou\x00ng': 'shouting', 'sta\x00on': 'station',
  'tempta\x00on': 'temptation', 'tempta\x00ons': 'temptations', 'tribula\x00on': 'tribulation',
  'trus\x00ng': 'trusting', 'u\x00b': 'utib', 'u\x00n': 'utin', 'un\x00l': 'until',
  'unc\x00on': 'unction', 'unhas\x00ng': 'unhasting', 'unres\x00ng': 'unresting',
  'wai\x00ng': 'waiting', 'wan\x00ng': 'wanting', 'was\x00ng': 'wasting',
  'wri\x00en': 'written',
  
  // also add uppercase variants for titles
  'AC\x00ON': 'ACTION', 'CHRIS\x00AN': 'CHRISTIAN', 'LI\x00ED': 'LIFTED',
  'LI\x00LE': 'LITTLE', 'RES\x00NG': 'RESTING', 'UNC\x00ON': 'UNCTION'
};

function fixText(text) {
  let fixed = text;
  // some standalone ligatures
  fixed = fixed.replace(/\b\x00ll\b/g, 'till');
  fixed = fixed.replace(/\b\x00ll\b/g, 'till');
  
  // replace all keys case-insensitively
  for (const [bad, good] of Object.entries(replacements)) {
    // create a regex that matches exactly the word ignoring case
    const regex = new RegExp(bad, 'ig');
    fixed = fixed.replace(regex, (match) => {
      // try to preserve capitalization of first letter
      if (match[0] === match[0].toUpperCase()) {
        return good.charAt(0).toUpperCase() + good.slice(1);
      }
      return good;
    });
  }
  
  // replace any leftover null bytes with 'ti' as a fallback
  fixed = fixed.replace(/\x00/g, 'ti');
  return fixed;
}

const fixedData = data.map(hymn => ({
  number: hymn.number,
  title: fixText(hymn.title),
  lyrics: fixText(hymn.lyrics)
}));

fs.writeFileSync('src/assets/hymns.json', JSON.stringify(fixedData, null, 2));
console.log('Fixed hymns.json!');
