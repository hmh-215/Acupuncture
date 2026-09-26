import os, sys, json
from extract_clinical_video import process_video

base_dir = r"D:\huong\antigravity\châm cứu\TaiLieu-DauVao"
target_files = [
    ("kinh cân 22.mp4", "scripts/res_22.json", 60),
    ("kinh cân 2.mp4", "scripts/res_2.json", 60),
    ("kinh cân 3.mp4", "scripts/res_3.json", 90),
    ("kinh cân 20.mp4", "scripts/res_20.json", 120)
]

for v_file, out_j, interval in target_files:
    v_path = os.path.join(base_dir, v_file)
    print(f"\n==========================================")
    print(f"STARTING: {v_file}")
    try:
        process_video(v_path, out_j, frame_interval=interval)
    except Exception as e:
        print(f"Error processing {v_file}: {e}")
