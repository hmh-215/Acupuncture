with open("Giai-Phau-DHYHN/01-TongHop/raw_tap4_mach_tk.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines[:200]):
    if any(k in line for k in ["Bài ", "BÀI ", "ĐỘNG MẠCH", "TĨNH MẠCH", "THẦN KINH", "MỤC TIÊU"]):
        print(f"L{i}: {line.strip()[:80]}")
