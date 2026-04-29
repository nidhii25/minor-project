# FSLAKWSS

**Few-Shot Language-Agnostic Keyword Spotting System**

A real-time audio intelligence platform that uses few-shot learning to detect and localize keywords in audio streams — regardless of language.

## Features

- 🎙️ **Language-Agnostic** — Works on any language using Log-Mel spectrogram features
- ⚡ **Sliding Window Inference** — Localizes keywords with precise timestamps in variable-duration audio
- 🧠 **Few-Shot Learning** — Prototypical Network trained on Google Speech Commands dataset
- 📊 **Interactive Dashboard** — Click any keyword result to jump to that exact moment in the audio player
- 📤 **CSV Export** — Download full keyword localization report

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v3 |
| ML Backend | Python · PyTorch · FastAPI · torchaudio |

## Quick Start

### Frontend

```bash
npm install
npm run dev
```
Open `http://localhost:5173`

### ML Backend

```bash
cd ml
pip install -r requirements.txt

# Train the model (downloads Speech Commands dataset automatically)
python train.py

# Start the API server
uvicorn api:app --reload
```

The API runs at `http://localhost:8000`. Upload any `.wav` file through the UI to get keyword timestamps.

## How It Works

1. Audio is uploaded and resampled to **16kHz**
2. Log-Mel spectrograms are extracted for language-agnostic features
3. The audio is sliced into **1-second overlapping windows** (step 0.5s)
4. Each window is classified using a **Prototypical Network** (few-shot embeddings)
5. Results are returned with **keyword, confidence score, and exact timestamp**
