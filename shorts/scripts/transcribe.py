import whisper
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = os.path.normpath(os.path.join(script_dir, '../public/video.mp4'))
output_path = os.path.normpath(os.path.join(script_dir, '../public/video.json'))

model = whisper.load_model("turbo")
result = model.transcribe(input_path, word_timestamps=True)

words_with_timestamps = []

for segment in result["segments"]:
    for word_info in segment["words"]:
        words_with_timestamps.append({
            "text": word_info["word"],
            "startMs": int(word_info["start"] * 1000),
            "endMs": int(word_info["end"] * 1000)
        })

with open(output_path, "w") as f:
    json.dump(words_with_timestamps, f, indent=2)

print(f"Word-level timestamps saved to '{output_path}'")