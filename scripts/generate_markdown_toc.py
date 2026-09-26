import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Giai-Phau-DHYHN/01-TongHop/muc_luc_cau_truc.json', 'r', encoding='utf-8') as f:
    chapters = json.load(f)

print(f"Loaded {len(chapters)} chapters.")

# Group chapters into anatomical systems
SYSTEM_GROUPS = [
    {
        "group_name": "I. NHẬP MÔN & ĐẠI CƯƠNG HỆ VẬN ĐỘNG (XƯƠNG - KHỚP - CƠ - MẠC)",
        "desc": "Nền tảng định vị không gian, cơ sinh học, chuỗi vận động và các vùng cơ mạc đầu - cổ - thân - chi.",
        "chapter_ids": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] # Nhập môn, Bài 1 -> 8
    },
    {
        "group_name": "II. HỆ MẠCH MÁU & THẦN KINH ĐẦU - CỔ VÀ TỨ CHI",
        "desc": "Hệ thống cấp máu và chi phối thần kinh ngoại biên, liên quan trực tiếp đến định vị huyệt và an toàn châm cứu.",
        "chapter_ids": [10, 11, 12, 13, 14] # Bài 9, 10, 11, 12, 13
    },
    {
        "group_name": "III. CÁC GIÁC QUAN (MẮT, TAI, MŨI, HẦU)",
        "desc": "Giải phẫu cơ quan thụ cảm và các dây thần kinh sọ liên quan (thị giác, tiền đình - ốc tai, khứu giác).",
        "chapter_ids": [15, 16, 17] # Bài 14, 15, 16
    },
    {
        "group_name": "IV. HỆ HÔ HẤP & TRUNG THẤT",
        "desc": "Đường dẫn khí, phổi, màng phổi và các liên quan giải phẫu quan trọng vùng ngực (cảnh báo an toàn tràn khí màng phổi).",
        "chapter_ids": [18, 19] # Bài 17, 18
    },
    {
        "group_name": "V. HỆ TUẦN HOÀN, TIM & HỆ BẠCH HUYẾT",
        "desc": "Đại tuần hoàn, tiểu tuần hoàn, giải phẫu tim, các thân mạch lớn và tuần hoàn bạch huyết.",
        "chapter_ids": [20, 21] # Bài 19, 20
    },
    {
        "group_name": "VI. HỆ TIÊU HÓA, Ổ BỤNG & PHÚC MẠC",
        "desc": "Ống tiêu hóa từ miệng đến hậu môn, các tuyến tiêu hóa (gan, tụy) và cấu trúc phúc mạc.",
        "chapter_ids": [22, 23, 24, 25, 26, 27] # Bài 21, 22, 23, 24, 25, 26
    },
    {
        "group_name": "VII. HỆ TIẾT NIỆU, SINH DỤC & ĐÁY CHẬU",
        "desc": "Thận, niệu quản, bàng quang, cơ quan sinh dục nam/nữ và hoành chậu hông - đáy chậu.",
        "chapter_ids": [28, 29, 30] # Bài 27, 28, 29
    },
    {
        "group_name": "VIII. HỆ THẦN KINH TRUNG ƯƠNG & HỆ THẦN KINH TỰ CHỦ",
        "desc": "Tủy sống, thân não, tiểu não, gian não, đại não, 12 đôi thần kinh sọ và hệ thần kinh giao cảm/đối giao cảm.",
        "chapter_ids": [31, 32, 33, 34, 35, 36, 37, 38] # Bài 30 -> 37
    },
    {
        "group_name": "IX. HỆ NỘI TIẾT",
        "desc": "Các tuyến nội tiết chính: tuyến yên, tuyến giáp, cận giáp, thượng thận, đảo tụy.",
        "chapter_ids": [39] # Bài 38
    },
    {
        "group_name": "X. CÁC BÀI THỊ GIÁO XƯƠNG & KHỚP",
        "desc": "Mô tả chi tiết từng xương trên tiêu bản thực tế: xương đầu mặt, xương thân, xương chi trên và chi dưới.",
        "chapter_ids": [40, 41, 42, 43] # Bài 39, 40, 41, 42
    },
    {
        "group_name": "XI. BỘ CÂU HỎI TRẮC NGHIỆM & LƯỢNG GIÁ",
        "desc": "Ngân hàng câu hỏi trắc nghiệm giải phẫu chuẩn của Đại học Y Hà Nội.",
        "chapter_ids": [44] # Phần III
    }
]

out = []
out.append("# MỤC LỤC CHI TIẾT & CHỈ MỤC GIẢI PHẪU HỌC NGƯỜI")
out.append("## Giáo Trình Giải Phẫu Người — Trường Đại Học Y Hà Nội")
out.append("")
out.append("> **Chủ biên**: PGS. TS. Nguyễn Văn Huy (Bộ môn Giải phẫu — ĐHYHN)  ")
out.append("> **Nguồn tài liệu gốc**: `Giai-Phau-DHYHN/00-Nguon/GOC-GIAOTRINH_Giai-Phau-Nguoi-Dai-Hoc-Y-Ha-Noi.pdf`  ")
out.append("> **Quy mô**: 516 trang | 42 Bài lý thuyết & thực hành | Hệ thống hóa phục vụ Châm cứu & Y học cổ truyền  ")
out.append("> **Đơn vị phân rã**: Skill `acupuncture-knowledge-synthesizer` kết hợp NotebookLM  ")
out.append("")
out.append("---")
out.append("")
out.append("## 📊 BẢNG TRA CỨU NHANH TỌA ĐỘ 42 BÀI HỌC THEO SỐ TRANG")
out.append("")
out.append("| STT | Tên Bài Học / Chuyên Đề | Trang Sách | Trang File PDF | Hệ Cơ Quan |")
out.append("|:---:|---|:---:|:---:|---|")

for i, ch in enumerate(chapters):
    # Determine system
    sys_name = "Khác"
    for g in SYSTEM_GROUPS:
        if i in g["chapter_ids"]:
            sys_name = g["group_name"].split('.')[1].split('(')[0].strip()
            break
    out.append(f"| {i+1} | **{ch['title']}** | Trang {ch['book_page']} | Trang {ch['pdf_page_start']} – {ch['pdf_page_end']} | {sys_name} |")

out.append("")
out.append("---")
out.append("")
out.append("## 📑 PHÂN RÃ CHI TIẾT TỪNG BÀI THEO TIỂU MỤC GIẢI PHẪU")
out.append("")

for g in SYSTEM_GROUPS:
    out.append(f"### {g['group_name']}")
    out.append(f"*{g['desc']}*")
    out.append("")
    
    for ch_id in g["chapter_ids"]:
        if ch_id >= len(chapters):
            continue
        ch = chapters[ch_id]
        out.append(f"#### 📘 [{ch_id+1}] {ch['title']}")
        out.append(f"- **Vị trí**: Sách trang `{ch['book_page']}` | PDF trang `{ch['pdf_page_start']} – {ch['pdf_page_end']}`")
        
        # Objectives
        if ch.get("objectives"):
            out.append("- **Mục tiêu học tập y khoa**:")
            for obj in ch["objectives"]:
                # clean number
                clean_obj = obj.strip()
                if clean_obj:
                    out.append(f"  + {clean_obj}")
                    
        # Sections
        sections = ch.get("sections", [])
        if sections:
            out.append("- **Các tiểu mục giải phẫu cấu thành**:")
            for s in sections:
                indent = "  " * s.get("level", 1)
                num = s.get("number", "")
                title = s.get("title", "")
                out.append(f"{indent}* **{num}** {title}")
        else:
            out.append("- **Các tiểu mục**: *(Nội dung tổng quan theo chuyên đề)*")
            
        out.append("")
    out.append("---")
    out.append("")

md_content = "\n".join(out)
with open("Giai-Phau-DHYHN/01-TongHop/MUCLUC_CHITIET_GiaiPhau_DHYHN.md", "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"Generated MUCLUC_CHITIET_GiaiPhau_DHYHN.md ({len(md_content)} bytes).")
