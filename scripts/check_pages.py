import json

with open('Giai-Phau-DHYHN/01-TongHop/muc_luc_cau_truc.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for b in data:
    so = b.get('so_bai')
    print(f"Index {b.get('id')}: Bài {so} - {b.get('ten_bai')} | Sách: {b.get('trang_sach')} | PDF: {b.get('pdf_page_start')} - {b.get('pdf_page_end')}")
