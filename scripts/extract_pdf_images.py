import pypdf
import os

pdf_path = "TaiLieu-DauVao/he_co_xuong.pdf"
out_dir = "TaiLieu-DauVao/he_co_xuong_pages"
os.makedirs(out_dir, exist_ok=True)

reader = pypdf.PdfReader(pdf_path)

for i, page in enumerate(reader.pages):
    for j, img in enumerate(page.images):
        ext = img.name.split('.')[-1]
        out_name = f"page_{i+1:02d}.{ext}"
        out_path = os.path.join(out_dir, out_name)
        with open(out_path, "wb") as f:
            f.write(img.data)
        print(f"Extracted Page {i+1} to {out_path} ({len(img.data)} bytes)")
