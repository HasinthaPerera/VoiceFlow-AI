import os
import uuid
import time
from typing import Optional
from gtts import gTTS
from dotenv import load_dotenv

load_dotenv()

AUDIO_DIR = os.getenv("AUDIO_DIR", "./generated_audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

# Map frontend language values → gTTS language codes
LANGUAGE_MAP = {
    "english": "en",
    "sinhala": "si",
    "tamil":   "ta",
    "hindi":   "hi",
}

# Map frontend voice types → gTTS tld (accent) for English
# For non-English, gTTS doesn't support tld variations, so we use defaults
VOICE_TLD_MAP = {
    "natural": "com",       # US English (most natural)
    "male":    "com.au",    # Australian accent (deeper)
    "female":  "co.uk",     # British accent (softer)
    "robotic": "com",       # No special support in gTTS; handled client-side
}


def generate_audio(
    text: str,
    language: str = "english",
    voice: str = "natural",
    speed: float = 1.0,
) -> dict:
    """
    Generates a TTS audio file using gTTS.

    Returns:
        dict with keys: filename, filepath, duration_estimate
    """
    lang_code = LANGUAGE_MAP.get(language.lower(), "en")
    tld = VOICE_TLD_MAP.get(voice.lower(), "com") if lang_code == "en" else "com"

    # Slow mode if speed < 0.8
    slow = speed < 0.8

    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    tts = gTTS(text=text, lang=lang_code, tld=tld, slow=slow)
    tts.save(filepath)

    # Rough duration estimate: ~150 words/min at normal speed
    word_count = len(text.split())
    wpm = 150 * speed
    duration_seconds = round((word_count / wpm) * 60, 1)

    return {
        "filename": filename,
        "filepath": filepath,
        "duration": duration_seconds,
        "char_count": len(text),
    }


def delete_audio_file(filename: str) -> bool:
    """Delete a generated audio file. Returns True if successful."""
    filepath = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False


def get_audio_filepath(filename: str) -> Optional[str]:
    """Returns the absolute path of an audio file if it exists."""
    filepath = os.path.join(AUDIO_DIR, filename)
    return filepath if os.path.exists(filepath) else None
