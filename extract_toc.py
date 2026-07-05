import re
import json

def get_toc():
    with open("raw_hymns.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    # The TOC is between "Hymn No." and "LEAD KINDLY LIGHT"
    start = raw.find("Hymn No.")
    end = raw.find("LEAD KINDLY LIGHTHYMN NO")
    if end == -1: end = raw.find("LEAD KINDLY LIGHT")
    
    toc_text = raw[start:end]
    
    # Each line in TOC looks like: "Lead Kindly Light -------------------------------------------------- 1"
    # or "Give Us O Lord Thy Unc on ---------------------------------- 13"
    lines = toc_text.split('\n')
    
    toc = []
    for line in lines:
        if '---' in line and not 'PAGE' in line:
            parts = line.split('---')
            title = parts[0].strip().upper()
            
            # The number is at the end of the line
            m = re.search(r'(\d+)$', line)
            if m:
                num = int(m.group(1))
                toc.append((num, title))
                
    # Sort just in case, but should be sequential
    toc.sort(key=lambda x: x[0])
    return toc

if __name__ == "__main__":
    toc = get_toc()
    print("Found in TOC:", len(toc))
    for num, title in toc[:5]:
        print(num, title)
    for num, title in toc[-5:]:
        print(num, title)
