from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db, User, GenerationHistory
from auth import get_current_user, verify_password, hash_password
from tts_service import delete_audio_file

router = APIRouter(prefix="/api/user", tags=["User"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    name: str


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return usage statistics for the dashboard."""
    CHAR_LIMIT = 100_000
    chars_used = current_user.characters_used or 0
    voices_generated = current_user.voices_generated or 0

    # Rough estimate: avg 150 words/min, avg 5 chars/word → chars to minutes
    hours_saved = round((chars_used / 5 / 150) / 60, 1)

    return {
        "characters_used": chars_used,
        "character_limit": CHAR_LIMIT,
        "voices_generated": voices_generated,
        "hours_saved": hours_saved,
    }


@router.put("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user's name."""
    if not payload.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name cannot be empty."
        )
    current_user.name = payload.name.strip()
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
    }


@router.put("/password")
def update_password(
    payload: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user's password."""
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated successfully."}


@router.delete("/me")
def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete logged-in user and all associated files and data."""
    if current_user.is_admin:
        # Check if they are the only admin
        admin_count = db.query(User).filter(User.is_admin == True).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are the only administrator. You cannot delete your account without promoting another user first."
            )

    # 1. Clean up audio files from disk
    user_histories = db.query(GenerationHistory).filter(GenerationHistory.user_id == current_user.id).all()
    for entry in user_histories:
        if entry.audio_filename:
            try:
                delete_audio_file(entry.audio_filename)
            except Exception:
                pass

    # 2. Delete history entries from DB
    db.query(GenerationHistory).filter(GenerationHistory.user_id == current_user.id).delete()

    # 3. Delete user record
    db.delete(current_user)
    db.commit()

    return {"detail": "Account deleted successfully."}

