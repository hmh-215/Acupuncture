import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("Giai-Phau-DHYHN/01-TongHop/raw_tap6_thankinh_noitiet.txt", "r", encoding="utf-8") as f:
    text = f.read()

pages = text.split("--- [PDF TRANG ")
print(f"Total pages in raw_tap6: {len(pages)}")

for p in pages[1:]:
    p_num = p.split("]")[0]
    p_content = p.split("---")[1] if "---" in p else p
    lines = [line.strip() for line in p_content.split("\n") if line.strip()]
    for line in lines[:8]:
        if any(f"BÀI {k}" in line.upper() or f"BÀI {k}." in line.upper() for k in range(30, 39)):
            print(f"P.{p_num}: {line}")
