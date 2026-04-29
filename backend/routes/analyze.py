from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os

from services.keyword_detection import detect_keywords

router = APIRouter()

@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    keywords: str = Form(...)
):
    # Save file
    file_path = f"temp/{file.filename}"
    os.makedirs("temp", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔥 Convert keywords string → list
    keyword_list = [k.strip().lower() for k in keywords.split(",") if k.strip()]

    # 🔥 Call ML logic
    result = detect_keywords(file_path, keyword_list)
    
    return {
        "status": "success",
        "report": result
    }