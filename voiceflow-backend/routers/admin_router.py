from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
from typing import Optional
from pydantic import BaseModel

from database import get_db, User, GenerationHistory
from auth import get_current_user
from tts_service import delete_audio_file

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

# ─── Admin Security Dependency ──────────────────────────────────────────────────

def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    return current_user


# ─── Stats Endpoint ─────────────────────────────────────────────────────────────

@router.get("/stats", dependencies=[Depends(get_current_admin)])
def get_global_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    
    # Calculate totals, default to 0 if None
    char_sum = db.query(func.sum(User.characters_used)).scalar() or 0
    voices_sum = db.query(func.sum(User.voices_generated)).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_characters_used": char_sum,
        "total_voices_generated": voices_sum,
    }


# ─── Users Endpoint ─────────────────────────────────────────────────────────────

@router.get("/users", dependencies=[Depends(get_current_admin)])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "is_admin": u.is_admin,
            "characters_used": u.characters_used,
            "voices_generated": u.voices_generated,
            "created_at": u.created_at,
        }
        for u in users
    ]


# ─── Toggle Admin Role ──────────────────────────────────────────────────────────

@router.put("/users/{user_id}/toggle-admin")
def toggle_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot toggle your own admin status.",
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
        
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"Successfully updated user admin status to {user.is_admin}.",
        "user_id": user.id,
        "is_admin": user.is_admin,
    }


# ─── Delete User Endpoint ───────────────────────────────────────────────────────

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account.",
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
        
    # 1. Clean up audio files from disk
    user_histories = db.query(GenerationHistory).filter(GenerationHistory.user_id == user_id).all()
    for entry in user_histories:
        if entry.audio_filename:
            delete_audio_file(entry.audio_filename)
            
    # 2. Delete history entries from DB
    db.query(GenerationHistory).filter(GenerationHistory.user_id == user_id).delete()
    
    # 3. Delete user record
    db.delete(user)
    db.commit()
    
    return {"message": "User and all associated data deleted successfully."}


# ─── Adjust Usage / Credits Endpoint ───────────────────────────────────────────

class AdjustUsageRequest(BaseModel):
    characters_used: int
    voices_generated: int

@router.put("/users/{user_id}/adjust-usage")
def adjust_user_usage(
    user_id: int,
    payload: AdjustUsageRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot adjust your own usage stats.",
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    
    user.characters_used = payload.characters_used
    user.voices_generated = payload.voices_generated
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"Successfully updated usage stats for {user.name}.",
        "user_id": user.id,
        "characters_used": user.characters_used,
        "voices_generated": user.voices_generated
    }


# ─── System-wide Generations Logs Endpoint ─────────────────────────────────────

@router.get("/generations", dependencies=[Depends(get_current_admin)])
def get_all_generations(
    search: Optional[str] = Query(None, description="Search by user name, email, title, or text"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(GenerationHistory, User).join(User, GenerationHistory.user_id == User.id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            User.email.ilike(search_term) |
            User.name.ilike(search_term) |
            GenerationHistory.title.ilike(search_term) |
            GenerationHistory.text.ilike(search_term)
        )
        
    total = query.count()
    results = query.order_by(GenerationHistory.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": gen.id,
                "title": gen.title,
                "text": gen.text,
                "language": gen.language,
                "voice": gen.voice,
                "speed": gen.speed,
                "pitch": gen.pitch,
                "audio_url": f"/api/tts/audio/{gen.audio_filename}" if gen.audio_filename else None,
                "duration": gen.duration,
                "char_count": gen.char_count,
                "created_at": gen.created_at.isoformat(),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                }
            }
            for gen, user in results
        ]
    }


# ─── Delete Generation Endpoint ────────────────────────────────────────────────

@router.delete("/generations/{generation_id}")
def delete_generation(
    generation_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    gen = db.query(GenerationHistory).filter(GenerationHistory.id == generation_id).first()
    if not gen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation record not found."
        )
        
    # Clean up audio file from disk
    if gen.audio_filename:
        try:
            delete_audio_file(gen.audio_filename)
        except Exception:
            pass
            
    db.delete(gen)
    db.commit()
    
    return {"message": "Generation log and audio file deleted successfully."}

