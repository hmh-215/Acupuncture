import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("Giai-Phau-DHYHN/01-TongHop/raw_tap4_mach_tk.txt", "r", encoding="utf-8") as f:
    text = f.read()

pages = text.split("--- [PDF TRANG ")
print(f"Total pages in raw_tap4: {len(pages)}")

# Print preview of titles and headings
for p in pages[1:]:
    p_num = p.split("]")[0]
    p_content = p.split("---")[1] if "---" in p else p
    lines = [line.strip() for line in p_content.split("\n") if line.strip()]
    header = lines[0] if lines else ""
    for line in lines[:10]:
        if any(w in line.upper() for w in ["BÀI ", "ĐỘNG MẠCH", "TĨNH MẠCH", "THẦN KINH", "ĐÁM RỐI"]):
            print(f"P.{p_num}: {line}")
