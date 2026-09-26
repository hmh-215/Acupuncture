import os, sys, json
from extract_clinical_video import process_video

base_dir = r"D:\huong\antigravity\châm cứu\TaiLieu-DauVao"
target_files = [
    ("kinh cân 25.mp4", "scripts/res_25.json", 15),
    ("kinh cân 32.mp4", "scripts/res_32.json", 20),
    ("kinh cân 4.mp4", "scripts/res_4.json", 20),
    ("kinh cân 5.mp4", "scripts/res_5.json", 20),
    ("kinh cân 26.mp4", "scripts/res_26.json", 25),
    ("kinh cân 24.mp4", "scripts/res_24.json", 25),
    ("kinh cân 30.mp4", "scripts/res_30.json", 30)
]

for v_file, out_j, interval in target_files:
    v_path = os.path.join(base_dir, v_file)
    print(f"\n==========================================")
    print(f"STARTING: {v_file}")
    try:
        process_video(v_path, out_j, frame_interval=interval)
    except Exception as e:
        print(f"Error processing {v_file}: {e}")
