const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/assets/hymns.json', 'utf8'));

const replacements = {
  ' on': 'tion', ' a er': ' after', ' a rac': ' attrac', ' ac on': ' action',
  ' accep ng': ' accepting', ' acclama on': ' acclamation', ' adora on': ' adoration',
  ' anoin ng': ' anointing', ' ba le': ' battle', ' bap zed': ' baptized',
  ' be er': ' better', ' beau ful': ' beautiful', ' bi er': ' bitter',
  ' boas ngs': ' boastings', ' boun ful': ' bountiful', ' cap ve': ' captive',
  ' celes al': ' celestial', ' chan ng': ' chanting', ' chris an': ' christian',
  ' condemna on': ' condemnation', ' condi ons': ' conditions', ' contri on': ' contrition',
  ' crea on': ' creation', ' direc on': ' direction', ' doub ul': ' doubtful',
  ' e be': ' etibe', ' e e': ' etie', ' e ene': ' etiene', ' e ened': ' etiened',
  ' emp ed': ' emptied', ' everlas ng': ' everlasting', ' fac on': ' faction',
  ' fain ng': ' fainting', ' fe ers': ' fetters', ' forgo en': ' forgotten',
  ' fran c': ' frantic', ' frui ul': ' fruitful', ' gen les': ' gentiles',
  ' gi s': ' gifts', ' gran ng': ' granting', ' hear elt': ' heartfelt',
  ' i e': ' itie', ' incanta ons': ' incantations', ' jus ce': ' justice',
  ' le ers': ' letters', ' li ed': ' lifted', ' li le': ' little',
  ' life me': ' lifetime', ' lo y': ' lofty', ' ma er': ' matter',
  ' mbuo dem': ' mbuotidem', ' mee ng': ' meeting', ' na on': ' nation',
  ' na ons': ' nations', ' nke en': ' nketien', ' nke ene': ' nketiene',
  ' nsa tong': ' nsatitong', ' o m': ' oftim', ' ostenta on': ' ostentation',
  ' pa ent': ' patient', ' pan ng': ' panting', ' peniten al': ' penitential',
  ' po er': ' potter', ' por on': ' portion', ' protec ng': ' protecting',
  ' providen al': ' providential', ' res ng': ' resting', ' resis ng': ' resisting',
  ' s ll': ' still', ' sa ate': ' satiate', ' sa sfy': ' satisfy',
  ' salva on': ' salvation', ' sanc fy': ' sanctify', ' sca ered': ' scattered',
  ' se ng': ' setting', ' shou ng': ' shouting', ' sta on': ' station',
  ' tempta on': ' temptation', ' tempta ons': ' temptations', ' tribula on': ' tribulation',
  ' trus ng': ' trusting', ' u b': ' utib', ' u n': ' utin', ' un l': ' until',
  ' unc on': ' unction', ' unhas ng': ' unhasting', ' unres ng': ' unresting',
  ' wai ng': ' waiting', ' wan ng': ' wanting', ' was ng': ' wasting',
  ' wri en': ' written',
  ' ll': 'till',
  ' a ec ': ' affec ',
  ' sa sfi ': ' satisfi '
};

// Also replace things like Emp ed -> Emptied where it's part of a word boundary
function fixText(text) {
  if (!text) return text;
  let fixed = text;
  
  for (const [bad, good] of Object.entries(replacements)) {
    // Create regex matching the exact broken sequence
    // Using \b to ensure we match word boundaries for the parts
    // e.g. " emp ed" -> \bemp\s+ed\b
    const parts = bad.trim().split(' ');
    if (parts.length === 2) {
      const regex = new RegExp(`\\b${parts[0]}\\s+${parts[1]}\\b`, 'ig');
      const goodTrimmed = good.trim();
      
      fixed = fixed.replace(regex, (match) => {
        let res = goodTrimmed;
        // preserve casing of first character
        if (match[0] === match[0].toUpperCase()) {
          res = res.charAt(0).toUpperCase() + res.slice(1);
        }
        return res;
      });
    } else {
      // Just a simple suffix match for things like " on"
      const regex = new RegExp(bad.replace(/ /g, '\\b\\s+'), 'ig');
      fixed = fixed.replace(regex, (match) => {
        return good; // We might lose capitalization on suffixes but that's fine
      });
    }
  }
  
  // Specific fix for the messy footer of Channels Only
  fixed = fixed.replace(/CHANNELS ONLY\s*1\./g, '');
  
  return fixed.trim();
}

const cleaned = data.map(hymn => ({
  ...hymn,
  title: fixText(hymn.title),
  lyrics: fixText(hymn.lyrics)
}));

fs.writeFileSync('src/assets/hymns.json', JSON.stringify(cleaned, null, 2));
console.log('Fixed spaces!');
