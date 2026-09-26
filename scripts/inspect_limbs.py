import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')
reader = pypdf.PdfReader('TaiLieu-DauVao/Giải-Phẫu-Người-Đại-Học-Y-Hà-Nội.pdf')

for p in range(65, 105):
    txt = reader.pages[p].extract_text() or ''
    for line in txt.split('\n')[:5]:
        if 'BÀI ' in line.upper() or 'CƠ ' in line.upper():
            print(f"PDF page {p+1} (Book page ~{p-2}): {line.strip()}")
