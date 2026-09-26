import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Giai-Phau-DHYHN/01-TongHop/muc_luc_cau_truc.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    idx = item.get('id')
    title = item.get('title')
    bp = item.get('book_page')
    ps = item.get('pdf_page_start')
    pe = item.get('pdf_page_end')
    print(f"[{idx}] {title} | Trang sách: {bp} | PDF: {ps} - {pe}")
