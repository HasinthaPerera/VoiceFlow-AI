import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from database import get_db, User, GenerationHistory
from auth import get_current_user
from tts_service import generate_audio, delete_audio_file, get_audio_filepath

router = APIRouter(prefix="/api/tts", tags=["Text-to-Speech"])

MAX_CHARS = 5000


# ─── Schemas ──────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    text: str
    language: str = "english"
    voice: str = "natural"
    speed: float = 1.0
    pitch: float = 1.0
    title: Optional[str] = None


class GenerateResponse(BaseModel):
    id: int
    audio_url: str
    duration: float
    char_count: int
    title: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateResponse)
def generate_voice(
    payload: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate input
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    if len(payload.text) > MAX_CHARS:
        raise HTTPException(status_code=400, detail=f"Text exceeds {MAX_CHARS} character limit.")

    # Generate audio via gTTS
    try:
        result = generate_audio(
            text=payload.text,
            language=payload.language,
            voice=payload.voice,
            speed=payload.speed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

    # Auto-generate a title if none provided
    title = payload.title or payload.text[:50].strip().replace("\n", " ")

    # Save to history
    history_entry = GenerationHistory(
        user_id=current_user.id,
        title=title,
        text=payload.text,
        language=payload.language,
        voice=payload.voice,
        speed=payload.speed,
        pitch=payload.pitch,
        audio_filename=result["filename"],
        duration=result["duration"],
        char_count=result["char_count"],
    )
    db.add(history_entry)

    # Update user usage stats
    current_user.characters_used += result["char_count"]
    current_user.voices_generated += 1
    db.commit()
    db.refresh(history_entry)

    return GenerateResponse(
        id=history_entry.id,
        audio_url=f"/api/tts/audio/{result['filename']}",
        duration=result["duration"],
        char_count=result["char_count"],
        title=title,
    )


@router.get("/audio/{filename}")
def serve_audio(filename: str):
    """Stream the generated MP3 audio file. No auth needed — filenames are UUIDs."""
    # Security: only allow valid .mp3 filenames, block path traversal
    if not filename.endswith(".mp3") or "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    filepath = get_audio_filepath(filename)
    if not filepath:
        raise HTTPException(status_code=404, detail="Audio file not found.")

    return FileResponse(filepath, media_type="audio/mpeg", filename=filename)
