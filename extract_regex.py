import re
import json
from extract_toc import get_toc

def clean_text(text):
    if not text: return ""
    text = text.replace("\x00", " ")
    replacements = {
        "Chris an": "Christian", "ac on": "action", "salva on": "salvation",
        "se ng": "setting", "li ed": "lifted", "res ng": "resting",
        "trus ng": "trusting", "wai ng": "waiting", "direc on": "direction",
        "protec ng": "protecting", "ostenta on": "ostentation", "s ll": "still",
        " ll ": " till ", "pow’r": "pow'r", "unc on": "unction",
        "CHRIS AN": "CHRISTIAN", "AC ON": "ACTION", "SALVA ON": "SALVATION",
        "SE NG": "SETTING", "LI ED": "LIFTED", "RES NG": "RESTING",
        "TRUS NG": "TRUSTING", "WAI NG": "WAITING", "DIREC ON": "DIRECTION",
        "PROTEC NG": "PROTECTING", "OSTENTA ON": "OSTENTATION", "S LL": "STILL",
        " LL ": " TILL ", "POW’R": "POW'R", "UNC ON": "UNCTION",
        "LI LE": "LITTLE"
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text.strip()

def build_pattern(title):
    # Ignore non-alphanumeric chars in matching
    chars = [re.escape(c) for c in title if c.isalnum()]
    # allow any whitespace, punctuation, page numbers, or "HYMN NO" between chars
    # actually, that's too loose. Just allow whitespace, newlines, and punctuation
    return r'[^a-zA-Z0-9]*'.join(chars)

def parse_with_toc():
    toc = get_toc()
    
    with open("raw_hymns.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    # Clean out TOC and page numbers first to make matching easier
    start_idx = raw.find("LEAD KINDLY LIGHT")
    if start_idx != -1:
        raw = raw[start_idx:]
    raw = re.sub(r'--- PAGE \d+ ---', '', raw)
    raw = raw.replace("HYMN NO", "")
    
    hymns = []
    
    # We will search for each title sequentially
    current_pos = 0
    
    for i, (num, title) in enumerate(toc):
        if num == 85: title = "LOVE LIFTED ME"
        if num == 13: title = "GIVE US O LORD THY UNCTION"
        if num == 51: title = "LIGHT UP THE FIRE AND LET THE FLAME BURN"
        if num == 10: title = "GOD GIVE US CHRISTIAN HOMES"
        
        title = clean_text(title).upper()
        
        pat = build_pattern(title)
        match = re.search(pat, raw[current_pos:], re.IGNORECASE)
        if not match:
            print(f"COULD NOT FIND TITLE: {title}")
            # Try a looser match?
            continue
            
        start = current_pos + match.start()
        end = current_pos + match.end()
        
        # If this is not the first hymn, the text from current_pos to start is the lyrics of the previous hymn!
        if hymns:
            lyrics = raw[current_pos:start].strip()
            # Strip trailing digits from lyrics if any (sometimes the next hymn number is attached)
            lyrics = re.sub(r'\d+$', '', lyrics).strip()
            hymns[-1]['lyrics'] = clean_text(lyrics)
            
        hymns.append({
            "number": num,
            "title": clean_text(title),
            "lyrics": ""
        })
        
        current_pos = end
        
    # Last hymn
    if hymns:
        lyrics = raw[current_pos:].strip()
        hymns[-1]['lyrics'] = clean_text(lyrics)
        
    with open("assets/hymns.json", "w", encoding="utf-8") as f:
        json.dump(hymns, f, indent=2)
        
    print(f"Extracted {len(hymns)} hymns successfully.")

if __name__ == "__main__":
    parse_with_toc()
