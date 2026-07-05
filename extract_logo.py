import fitz # PyMuPDF
import sys

def extract_images():
    pdf_path = "UPPER ROOM HYMNS-COMPLETE_071732.pdf"
    doc = fitz.open(pdf_path)
    page = doc[0] # First page
    images = page.get_images()
    
    for img_index, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        with open(f"public/praying_hands.{image_ext}", "wb") as f:
            f.write(image_bytes)
        print(f"Extracted public/praying_hands.{image_ext}")
        break # Just get the first one, which is usually the logo

if __name__ == "__main__":
    extract_images()
