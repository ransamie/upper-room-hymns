import sys
import io
import re

try:
    import pypdf
except ImportError:
    pass

def extract_raw_text():
    reader = pypdf.PdfReader(r"e:\Users\Ransom\Documents\GitHub\upper-room-hymns\UPPER ROOM HYMNS-COMPLETE_071732.pdf")
    
    with io.open("raw_hymns.txt", "w", encoding="utf-8") as f:
        for i in range(len(reader.pages)):
            text = reader.pages[i].extract_text()
            if text:
                f.write(f"\n--- PAGE {i} ---\n")
                f.write(text)
                
if __name__ == "__main__":
    extract_raw_text()
    print("Extraction complete. Wrote to raw_hymns.txt")
