import sys
import re
import json
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = "TaiLieu-DauVao/Giải-Phẫu-Người-Đại-Học-Y-Hà-Nội.pdf"
reader = pypdf.PdfReader(PDF_PATH)
total_pages = len(reader.pages)
print(f"Loaded PDF: {total_pages} pages.")

# Table of Contents from the book
TOC_RAW = [
    ("Nhập môn giải phẫu học", 7),
    ("Bài 1. Đại cương về hệ xương - khớp", 12),
    ("Bài 2. Đại cương về hệ cơ - cơ và mạc của đầu", 22),
    ("Bài 3. Cơ - mạc của cổ và thân", 33),
    ("Bài 4A. Thành ngực - bụng và ống bẹn", 48),
    ("Bài 4B. Đáy chậu", 58),
    ("Bài 5. Cơ của các vùng nách và cánh tay", 65),
    ("Bài 6. Cơ của các vùng cẳng tay và bàn tay", 73),
    ("Bài 7. Cơ của các vùng mông và đùi", 81),
    ("Bài 8. Cơ của các vùng cẳng chân và bàn chân", 88),
    ("Bài 9. Động mạch dưới đòn và các động mạch cảnh", 97),
    ("Bài 10. Tĩnh mạch và thần kinh của đầu - cổ", 104),
    ("Bài 11. Mạch máu của các chi", 113),
    ("Bài 12. Thần kinh của chi trên", 133),
    ("Bài 13. Thần kinh của chi dưới", 142),
    ("Bài 14. Mắt và thần kinh thị giác", 152),
    ("Bài 15. Tai và thần kinh tiền đình - ốc tai", 161),
    ("Bài 16. Mũi và thần kinh khứu giác, hầu", 172),
    ("Bài 17. Thanh quản, khí quản và các tuyến có liên quan", 178),
    ("Bài 18. Phế quản chính, cuống phổi và phổi", 187),
    ("Bài 19. Đại cương hệ tuần hoàn, các mạch chủ, tĩnh mạch cửa, hệ tĩnh mạch đơn và tỳ", 198),
    ("Bài 20. Tim và hệ bạch huyết", 210),
    ("Bài 21. Miệng và thực quản", 222),
    ("Bài 22. Trung thất, ổ bụng và phúc mạc", 231),
    ("Bài 23. Dạ dày, ruột non và tuỵ", 244),
    ("Bài 24. Gan, đường mật ngoài gan và cuống gan", 253),
    ("Bài 25. Ruột già", 262),
    ("Bài 26. Mạch và thần kinh của các cơ quan tiêu hoá trong bụng", 269),
    ("Bài 27. Thận và niệu quản", 281),
    ("Bài 28. Bàng quang, niệu đạo và hệ sinh dục nam", 291),
    ("Bài 29. Hệ sinh dục nữ", 304),
    ("Bài 30. Đại cương về hệ thần kinh. Các màng não - tuỷ", 313),
    ("Bài 31. Tuỷ sống", 322),
    ("Bài 32. Thân não và tiểu não", 327),
    ("Bài 33. Các thần kinh sọ", 336),
    ("Bài 34. Gian não. Các não thất IV và III", 350),
    ("Bài 35. Đại não", 355),
    ("Bài 36. Hệ thần kinh tự chủ", 362),
    ("Bài 37. Các đường dẫn truyền thần kinh", 374),
    ("Bài 38. Hệ nội tiết", 383),
    ("Bài 39. Các xương và khớp của đầu", 388),
    ("Bài 40. Các xương và khớp của thân", 401),
    ("Bài 41. Các xương và khớp của chi trên", 413),
    ("Bài 42. Các xương và khớp của chi dưới", 426),
    ("Phần III. Bộ câu hỏi trắc nghiệm", 444)
]

# Find exact PDF pages for each lesson
mapped_chapters = []
for i, (title, book_pg) in enumerate(TOC_RAW):
    # Determine search window around expected offset
    # In earlier checks, PDF pg 9 = Book pg 7 (+2), PDF pg 16 = Book pg 12 (+4)
    # So offset is roughly +2 to +6
    expected_pdf_idx = book_pg + 3
    search_start = max(0, expected_pdf_idx - 6)
    search_end = min(total_pages, expected_pdf_idx + 6)
    
    found_idx = None
    first_part = title.split('.')[0].strip().upper() # e.g. "BÀI 1", "NHẬP MÔN"
    
    for p in range(search_start, search_end):
        text = reader.pages[p].extract_text() or ""
        # Check if page has header/title matching
        if first_part in text.upper() and ("MỤC TIÊU" in text.upper() or "GIẢI PHẪU" in text.upper() or "BÀI " in text.upper()):
            found_idx = p
            break
            
    if found_idx is None:
        # Broader search if needed
        for p in range(max(0, expected_pdf_idx - 15), min(total_pages, expected_pdf_idx + 15)):
            text = reader.pages[p].extract_text() or ""
            if first_part in text.upper():
                found_idx = p
                break
                
    if found_idx is None:
        found_idx = expected_pdf_idx
        
    mapped_chapters.append({
        "id": i,
        "title": title,
        "book_page": book_pg,
        "pdf_page_start": found_idx + 1 # 1-indexed
    })

# Set end pages
for i in range(len(mapped_chapters)):
    if i < len(mapped_chapters) - 1:
        mapped_chapters[i]["pdf_page_end"] = mapped_chapters[i+1]["pdf_page_start"] - 1
    else:
        mapped_chapters[i]["pdf_page_end"] = total_pages

print("Mapped chapter boundaries:")
for ch in mapped_chapters:
    print(f"{ch['title']}: Book p.{ch['book_page']} -> PDF p.{ch['pdf_page_start']}-{ch['pdf_page_end']}")

# Now for each chapter, extract subsections
heading_pattern = re.compile(r'^(\d+(\.\d+){0,3}\.?\s+[A-ZÀ-ỸĐ].*?)$', re.MULTILINE)
section_num_pattern = re.compile(r'^(\d+(\.\d+){0,3})\.?\s+(.*)$')

for ch in mapped_chapters:
    p_start = ch["pdf_page_start"] - 1
    p_end = ch["pdf_page_end"]
    
    ch_text = ""
    for p in range(p_start, min(p_end, total_pages)):
        ch_text += reader.pages[p].extract_text() or "" + "\n"
        
    # Extract "MỤC TIÊU"
    objectives = []
    if "MỤC TIÊU" in ch_text.upper():
        obj_match = re.search(r'MỤC TIÊU\s*(.*?)(?=\n\s*1\.\s+|\n\s*1\.1\s+|\n\s*[A-ZÀ-Ỹ\s]{4,}\n)', ch_text, re.DOTALL)
        if obj_match:
            raw_obj = obj_match.group(1).strip()
            # clean lines
            obj_lines = [l.strip() for l in raw_obj.split('\n') if l.strip()]
            objectives = obj_lines[:5]
            
    ch["objectives"] = objectives
    
    # Extract sections like 1., 1.1., 1.2., 2., 2.1., etc.
    lines = ch_text.split('\n')
    sections = []
    seen_sec = set()
    
    for line in lines:
        line_s = line.strip()
        # Look for pattern like "1. ĐẠI CƯƠNG VỀ..." or "1.1. Định nghĩa..."
        m = section_num_pattern.match(line_s)
        if m:
            num = m.group(1)
            sec_title = m.group(3).strip()
            # Filter noise: numbers without title or too long or page numbers
            if len(sec_title) > 2 and len(sec_title) < 120 and not sec_title.isdigit():
                # Avoid duplicates
                full_key = f"{num} {sec_title[:30]}"
                if full_key not in seen_sec:
                    seen_sec.add(full_key)
                    sections.append({
                        "number": num,
                        "title": sec_title,
                        "level": num.count('.') + 1
                    })
                    
    ch["sections"] = sections

# Save structured JSON
with open("Giai-Phau-DHYHN/01-TongHop/muc_luc_cau_truc.json", "w", encoding="utf-8") as f:
    json.dump(mapped_chapters, f, ensure_ascii=False, indent=2)

print("Saved structured TOC to Giai-Phau-DHYHN/01-TongHop/muc_luc_cau_truc.json")
