from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import os

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
