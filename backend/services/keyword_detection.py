import re
from models.whisper_model import transcribe_audio

def detect_keywords(file_path, keywords):
    result = transcribe_audio(file_path)

    keywords_set = set(keywords)
    detections = []

    for segment in result.get("segments", []):
        if not isinstance(segment, dict):
            continue

        for w in segment["words"]:
            word_text = w["word"].lower().strip()
            word_text = re.sub(r"[^\w]", "", word_text)

            if word_text in keywords_set:
                detections.append({
                    "keyword": word_text,
                    "timestamp": f"{w['start']:.2f}s",
                    "exact_sec": w["start"],
                    "confidence": 0.95
                })
    # 🔥 ADD THIS HERE
    print("\n===== FINAL DETECTIONS =====")
    print(detections)
    print("============================\n")

    return detections