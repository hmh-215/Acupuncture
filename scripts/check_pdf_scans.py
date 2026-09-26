import pypdf
import os

pdf_path = "TaiLieu-DauVao/he_co_xuong.pdf"
reader = pypdf.PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

for i, page in enumerate(reader.pages):
    text = page.extract_text() or ""
    images = page.images
    print(f"Page {i+1}: text length = {len(text)}, images count = {len(images)}")
