import pdfplumber
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
    hymns = []
    current_hymn = None
    
    with pdfplumber.open(r"e:\Users\Ransom\Documents\GitHub\upper-room-hymns\UPPER ROOM HYMNS-COMPLETE_071732.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            if i < 5: continue # Skip TOC and preface
            
            text = page.extract_text(layout=True)
            if not text: continue
            
            # Since layout=True preserves spaces, we should collapse multiple spaces for easier parsing,
            # or extract without layout but keeping visual order.
            # pdfplumber's default extract_text() preserves visual order!
            text_normal = page.extract_text()
            if not text_normal: continue
            
            lines = text_normal.split('\n')
            
            for idx, line in enumerate(lines):
                line = clean_text(line)
                if not line: continue
                
                # Check for "HYMN NO X"
                match = re.search(r'HYMN NO\s*(\d+)', line)
                if not match and idx < len(lines)-1:
                    # Sometimes it's split across lines
                    combined = line + " " + clean_text(lines[idx+1])
                    match = re.search(r'HYMN NO\s*(\d+)', combined)
                
                if match:
                    num = int(match.group(1))
                    if current_hymn and current_hymn['number'] != num:
                        hymns.append(current_hymn)
                    
                    if not current_hymn or current_hymn['number'] != num:
                        # Find title. The title is usually the line(s) before this.
                        # We can look back in our parsed lines, or just rely on TOC.
                        current_hymn = {
                            "number": num,
                            "title": "",
                            "lyrics": ""
                        }
                    continue
                
                if current_hymn:
                    current_hymn["lyrics"] += line + "\n"
                    
        if current_hymn:
            hymns.append(current_hymn)
            
    # Dump to json
    with open("hymns.json", "w", encoding="utf-8") as f:
        json.dump(hymns, f, indent=2)

if __name__ == "__main__":
    parse()
