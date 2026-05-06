import whisper
import imageio_ffmpeg

ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()

model = None

def get_model():
    global model

    if model is None:
        model = whisper.load_model("tiny")

    return model

def transcribe_audio(file_path):
    model = get_model()

    result = model.transcribe(
        file_path,
        word_timestamps=True,
        fp16=False
    )

    return result