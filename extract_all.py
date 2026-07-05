import fitz
import os

def extract_all_images():
    pdf_path = "UPPER ROOM HYMNS-COMPLETE_071732.pdf"
    doc = fitz.open(pdf_path)
    
    os.makedirs("extracted_images", exist_ok=True)
    
    for i in range(min(5, len(doc))):
        page = doc[i]
        images = page.get_images()
        for j, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            filepath = f"extracted_images/page{i}_img{j}.{image_ext}"
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            print(f"Extracted {filepath}")

if __name__ == "__main__":
    extract_all_images()
