import pypdf
import sys

def extract_pages(pdf_path, start_page, end_page, out_path):
    reader = pypdf.PdfReader(pdf_path)
    total = len(reader.pages)
    print(f"Total pages: {total}")
    
    extracted = []
    for p in range(start_page - 1, min(end_page, total)):
        text = reader.pages[p].extract_text() or ""
        extracted.append(f"--- [PDF TRANG {p+1}] ---\n" + text)
        
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(extracted))
    print(f"Saved {len(extracted)} pages to {out_path}")

if __name__ == "__main__":
    pdf = "Giai-Phau-DHYHN/00-Nguon/GOC-GIAOTRINH_Giai-Phau-Nguoi-Dai-Hoc-Y-Ha-Noi.pdf"
    # Tập 4: Bài 9, 10, 11, 12, 13 (PDF 101 - 155)
    extract_pages(pdf, 101, 155, "Giai-Phau-DHYHN/01-TongHop/raw_tap4_mach_tk.txt")
