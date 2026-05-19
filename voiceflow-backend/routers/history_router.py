from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db, User, GenerationHistory
from auth import get_current_user
from tts_service import delete_audio_file

router = APIRouter(prefix="/api/history", tags=["History"])


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/")
def get_history(
    search: Optional[str] = Query(None, description="Search by title or text"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's generation history, newest first."""
    query = db.query(GenerationHistory).filter(
        GenerationHistory.user_id == current_user.id
    )

    if search:
        query = query.filter(
            GenerationHistory.title.ilike(f"%{search}%")
            | GenerationHistory.text.ilike(f"%{search}%")
        )

    total = query.count()
    items = query.order_by(GenerationHistory.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "text": item.text,
                "language": item.language,
                "voice": item.voice,
                "speed": item.speed,
                "pitch": item.pitch,
                "audio_url": f"/api/tts/audio/{item.audio_filename}" if item.audio_filename else None,
                "duration": item.duration,
                "char_count": item.char_count,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ],
    }


@router.delete("/{item_id}")
def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a history entry and its associated audio file."""
    item = db.query(GenerationHistory).filter(
        GenerationHistory.id == item_id,
        GenerationHistory.user_id == current_user.id,
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="History item not found.")

    # Delete the audio file from disk
    if item.audio_filename:
        delete_audio_file(item.audio_filename)

    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully."}
