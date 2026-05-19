from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db, User
from auth import get_current_user

router = APIRouter(prefix="/api/user", tags=["User"])


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
