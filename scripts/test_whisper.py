import os, sys, traceback

os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'

print("Python version:", sys.version)
try:
    import faster_whisper
    print("faster_whisper version:", faster_whisper.__version__)
    model = faster_whisper.WhisperModel("tiny", device="cpu", compute_type="int8")
    print("WhisperModel tiny successfully loaded!")
except Exception as e:
    traceback.print_exc()
