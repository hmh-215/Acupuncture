import os, sys, subprocess, json
sys.stdout.reconfigure(encoding='utf-8')
import speech_recognition as sr
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

def extract_audio(video_path, output_wav):
    cmd = [ffmpeg, "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", output_wav]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return os.path.exists(output_wav)

def extract_keyframes(video_path, output_dir, interval_sec=10):
    os.makedirs(output_dir, exist_ok=True)
    cmd = [
        ffmpeg, "-y", "-i", video_path,
        "-vf", f"fps=1/{interval_sec}",
        "-q:v", "2",
        os.path.join(output_dir, "frame_%04d.jpg")
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def transcribe_audio_chunks(wav_path, chunk_duration=20):
    r = sr.Recognizer()
    # Read duration
    import wave
    with wave.open(wav_path, 'rb') as wf:
        nframes = wf.getnframes()
        framerate = wf.getframerate()
        total_sec = nframes / float(framerate)

    results = []
    offset = 0.0
    while offset < total_sec:
        duration = min(chunk_duration, total_sec - offset)
        with sr.AudioFile(wav_path) as source:
            try:
                audio = r.record(source, offset=offset, duration=duration)
                text = r.recognize_google(audio, language="vi-VN")
                start_m, start_s = divmod(int(offset), 60)
                end_m, end_s = divmod(int(offset + duration), 60)
                results.append({
                    "start": f"{start_m:02d}:{start_s:02d}",
                    "end": f"{end_m:02d}:{end_s:02d}",
                    "text": text
                })
            except sr.UnknownValueError:
                pass
            except Exception as e:
                pass
        offset += duration
    return results, total_sec

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_video_info.py <video_filename>")
        sys.exit(1)
    
    video_name = sys.argv[1]
    base_dir = r"D:\huong\antigravity\châm cứu\TaiLieu-DauVao"
    video_path = os.path.join(base_dir, video_name)
    if not os.path.exists(video_path):
        video_path = video_name

    print(f"=== PROCESSING: {os.path.basename(video_path)} ===")
    temp_wav = "temp_audio.wav"
    temp_frames_dir = "temp_frames"
    
    extract_audio(video_path, temp_wav)
    extract_keyframes(video_path, temp_frames_dir, interval_sec=15)
    
    transcripts, total_sec = transcribe_audio_chunks(temp_wav, chunk_duration=25)
    print(f"Duration: {int(total_sec//60):02d}:{int(total_sec%60):02d}")
    print("Transcripts:")
    for t in transcripts:
        print(f"[{t['start']} - {t['end']}] {t['text']}")
        
    frames = os.listdir(temp_frames_dir) if os.path.exists(temp_frames_dir) else []
    print(f"Extracted {len(frames)} frames to {temp_frames_dir}")
