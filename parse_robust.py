import json
import re

def clean_text(text):
    if not text: return ""
    replacements = {
        "Chris an": "Christian",
        "ac on": "action",
        "salva on": "salvation",
        "se ng": "setting",
        "li ed": "lifted",
        "res ng": "resting",
        "trus ng": "trusting",
        "wai ng": "waiting",
        "direc on": "direction",
        "protec ng": "protecting",
        "ostenta on": "ostentation",
        "s ll": "still",
        " ll ": " till ",
        "pow’r": "pow'r",
        "unc on": "unction",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text.strip()

def parse():
    with open("raw_hymns.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    # Remove TOC (everything before "LEAD KINDLY LIGHT")
    start_idx = raw.find("LEAD KINDLY LIGHT")
    if start_idx != -1:
        raw = raw[start_idx:]

    # Remove page markers
    raw = re.sub(r'--- PAGE \d+ ---', '', raw)
    
    # The pattern we want to split by is: Title + HYMN NO + Number
    # But Title can be multiple lines.
    # Actually, HYMN NO \n <number> is very reliable.
    # Let's find all HYMN NO
    
    # Replace "TITLEHYMN NO" with "TITLE\nHYMN NO"
    raw = re.sub(r'([A-Z\s,!’\'-]+)HYMN NO', r'\1\nHYMN NO', raw)
    
    # Now find all blocks of HYMN NO
    # We will split the text by HYMN NO.
    parts = re.split(r'HYMN NO', raw)
    
    # parts[0] is the title of the first hymn.
    # parts[1] is lyrics of 1 + title of 2
    # parts[2] is lyrics of 2 + title of 3...
    
    hymns = []
    
    for i in range(1, len(parts)):
        num = i
        
        # The title is at the end of the PREVIOUS part.
        prev_part = parts[i-1].strip()
        # Usually titles are ALL CAPS.
        # Let's look at the previous part.
        prev_part = parts[i-1].strip()
        
        # Split prev_part into lines
        prev_lines = prev_part.split('\n')
        
        # Take lines from the end that are all caps (or mostly caps) as the title
        title_lines = []
        lyrics_lines = []
        
        if i == 1:
            title_lines = prev_lines
        else:
            # We are in lyrics of N-1 + title of N
            # Work backwards to find the title
            for line in reversed(prev_lines):
                line = line.strip()
                if not line: continue
                # If line is mostly uppercase, it's part of the title
                # We also assume titles don't end with punctuation like ., ,, ;, :, ?
                # and don't start with numbers like "1. "
                if re.match(r'^\d+\.', line) or line.endswith('.') or line.endswith(';') or line.endswith(','):
                    # Stop, this is lyrics
                    lyrics_lines.insert(0, line)
                    # All remaining lines going backwards are lyrics
                    break
                else:
                    # It might be title. But wait, what if lyrics line has no punctuation?
                    # Let's check uppercase ratio
                    uppers = sum(1 for c in line if c.isupper())
                    lowers = sum(1 for c in line if c.islower())
                    if uppers > lowers or (len(line) < 30 and lowers == 0):
                        title_lines.insert(0, line)
                    else:
                        lyrics_lines.insert(0, line)
                        break
                        
            # The rest of the lines are lyrics
            idx = len(prev_lines) - len(title_lines) - len(lyrics_lines)
            for j in range(idx - 1, -1, -1):
                lyrics_lines.insert(0, prev_lines[j])
                
            # Assign lyrics to previous hymn
            if hymns:
                hymns[-1]['lyrics'] = clean_text('\n'.join(lyrics_lines))
                
        title = " ".join([l.strip() for l in title_lines if l.strip()])
        # Strip trailing digits that might have been the hymn number
        title = re.sub(r'\d+$', '', title).strip()
        
        hymns.append({
            "number": num,
            "title": clean_text(title),
            "lyrics": "" # Will be filled in next iteration, or at the end
        })
        
    # The last part is lyrics for the last hymn
    if hymns:
        hymns[-1]['lyrics'] = clean_text(parts[-1])
        
    with open("assets/hymns.json", "w", encoding="utf-8") as f:
        json.dump(hymns, f, indent=2)

if __name__ == "__main__":
    parse()
