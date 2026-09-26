import os, sys, subprocess, json, shutil
sys.stdout.reconfigure(encoding='utf-8')
import speech_recognition as sr
from pydub import AudioSegment, silence

def process_video(video_path, output_json=None, frame_interval=15):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")
    
    video_name = os.path.basename(video_path)
    base_stem = os.path.splitext(video_name)[0]
    work_dir = os.path.join("temp_work", base_stem.replace(" ", "_").replace("(", "").replace(")", ""))
    os.makedirs(work_dir, exist_ok=True)
    frames_dir = os.path.join(work_dir, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    
    wav_path = os.path.join(work_dir, "audio.wav")
    
    # 1. Extract Audio
    cmd_audio = ["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", wav_path]
    subprocess.run(cmd_audio, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # 2. Extract Keyframes
    cmd_frames = ["ffmpeg", "-y", "-i", video_path, "-vf", f"fps=1/{frame_interval}", "-q:v", "2", os.path.join(frames_dir, "frame_%04d.jpg")]
    subprocess.run(cmd_frames, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # 3. Audio Processing & Transcription
    sound = AudioSegment.from_wav(wav_path).normalize()
    total_ms = len(sound)
    total_sec = total_ms / 1000.0
    
    r = sr.Recognizer()
    transcripts = []
    
    # Fixed window approach with slight overlap to ensure words are not cut
    window_sec = 18
    step_sec = 15
    cur_sec = 0.0
    
    while cur_sec < total_sec:
        dur = min(window_sec, total_sec - cur_sec)
        start_ms = int(cur_sec * 1000)
        end_ms = int((cur_sec + dur) * 1000)
        chunk = sound[start_ms:end_ms]
        
        chunk_wav = os.path.join(work_dir, "temp_chunk.wav")
        chunk.export(chunk_wav, format="wav")
        
        with sr.AudioFile(chunk_wav) as src:
            try:
                audio_data = r.record(src)
                text = r.recognize_google(audio_data, language="vi-VN")
                if text and text.strip():
                    sm, ss = divmod(int(cur_sec), 60)
                    em, es = divmod(int(cur_sec + dur), 60)
                    transcripts.append({
                        "start": f"{sm:02d}:{ss:02d}",
                        "end": f"{em:02d}:{es:02d}",
                        "start_sec": cur_sec,
                        "end_sec": cur_sec + dur,
                        "text": text.strip()
                    })
            except Exception:
                pass
        
        cur_sec += step_sec
    
    # Merge consecutive identical or overlapping transcripts
    merged_transcripts = []
    for t in transcripts:
        if not merged_transcripts:
            merged_transcripts.append(t)
        else:
            prev = merged_transcripts[-1]
            if t["text"] != prev["text"]:
                merged_transcripts.append(t)
                
    m, s = divmod(int(total_sec), 60)
    duration_str = f"{m:02d}:{s:02d}"
    
    frames = [os.path.join(frames_dir, f) for f in sorted(os.listdir(frames_dir)) if f.endswith(".jpg")]
    
    data = {
        "video_name": video_name,
        "video_path": video_path,
        "duration": duration_str,
        "total_seconds": total_sec,
        "transcripts": merged_transcripts,
        "keyframes": frames
    }
    
    if output_json:
        with open(output_json, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    print(f"Processed {video_name}: Duration {duration_str}, {len(merged_transcripts)} transcript segments, {len(frames)} keyframes.")
    return data

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_clinical_video.py <video_file> [output_json]")
        sys.exit(1)
    v_path = sys.argv[1]
    out_j = sys.argv[2] if len(sys.argv) > 2 else None
    process_video(v_path, out_j)
