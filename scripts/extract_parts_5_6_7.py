import pypdf

def extract_pages(pdf_path, start_page, end_page, out_path):
    reader = pypdf.PdfReader(pdf_path)
    total = len(reader.pages)
    print(f"Extracting {start_page} to {end_page} into {out_path}...")
    extracted = []
    for p in range(start_page - 1, min(end_page, total)):
        text = reader.pages[p].extract_text() or ""
        extracted.append(f"--- [PDF TRANG {p+1}] ---\n" + text)
        
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(extracted))
    print(f"Saved {len(extracted)} pages to {out_path}")

if __name__ == "__main__":
    pdf = "Giai-Phau-DHYHN/00-Nguon/GOC-GIAOTRINH_Giai-Phau-Nguoi-Dai-Hoc-Y-Ha-Noi.pdf"
    extract_pages(pdf, 156, 316, "Giai-Phau-DHYHN/01-TongHop/raw_tap5_noitang.txt")
    extract_pages(pdf, 317, 391, "Giai-Phau-DHYHN/01-TongHop/raw_tap6_thankinh_noitiet.txt")
    extract_pages(pdf, 392, 447, "Giai-Phau-DHYHN/01-TongHop/raw_tap7_thigiaoxuongkhop.txt")
