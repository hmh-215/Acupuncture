import os, sys, subprocess
sys.stdout.reconfigure(encoding='utf-8')
import speech_recognition as sr
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
video_path = r"D:\huong\antigravity\châm cứu\TaiLieu-DauVao\kinh cân 23.mp4"
wav_path = "test_audio_23.wav"

# Convert first 20s to 16kHz mono wav
cmd = [ffmpeg, "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", wav_path]
subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Audio extracted, wav size:", os.path.getsize(wav_path))

r = sr.Recognizer()
with sr.AudioFile(wav_path) as source:
    audio = r.record(source)

try:
    text = r.recognize_google(audio, language="vi-VN")
    print("Google STT Result:")
    print(text)
except Exception as e:
    print("STT Error:", e)

if os.path.exists(wav_path):
    os.remove(wav_path)
