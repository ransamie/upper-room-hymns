import json
import re

def clean_text(text):
    # Fix common ligature errors based on visual inspection
    replacements = {
        "Chris an": "Christian",
        "ac on": "action",
        "salva on": "salvation",
        "se ng": "setting",
        "li ed": "lifted",
        "res ng": "resting",
        "trus ng": "trusting",
        "wai ng": "waiting",
        " direc on": " direction",
        "protec ng": "protecting",
        "ostenta on": "ostentation",
        "s ll": "still",
        " ll": "till",
        "Th’": "Th'",
        " pow’r": " pow'r",
        "un c on": "unction", # just in case
        "unc on": "unction",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text.strip()

def parse_hymns():
    with open("raw_hymns.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    pages = raw.split("--- PAGE ")
    
    hymns = []
    
    for page in pages:
        if not page.strip(): continue
        # page string looks like: "7 ---\n1. How I praise..."
        lines = page.split("\n")
        page_num_str = lines[0].replace("---", "").strip()
        
        page_text = "\n".join(lines[1:]).strip()
        if not page_text:
            continue
            
        # Find HYMN NO \n <number>
        # Note: sometimes it's HYMN NO \n \n <number> or on the same line
        # Let's use regex
        
        # Regex to find HYMN NO optionally followed by whitespace/newlines then digits
        match = re.search(r'(.*?)(?:HYMN NO\s*\n\s*(\d+)|([A-Z\s,!’\'-]+)HYMN NO\s*\n\s*(\d+))(.*)', page_text, flags=re.DOTALL)
        
        if match:
            # Group 2 is the number if it was 'TITLE\nHYMN NO\n1'
            # Wait, my regex is a bit messy. 
            pass

    # A better approach: split by pages, then look for "HYMN NO"
    
if __name__ == "__main__":
    parse_hymns()
