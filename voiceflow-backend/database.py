from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./voiceflow.db")

# SQLite connection args (allows multi-thread usage in FastAPI)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Usage tracking
    characters_used = Column(Integer, default=0)
    voices_generated = Column(Integer, default=0)
    is_admin = Column(Boolean, default=False)


# ─── Generation History ─────────────────────────────────────────────────────────

class GenerationHistory(Base):
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=True)
    text = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    voice = Column(String(50), nullable=False)
    speed = Column(Float, default=1.0)
    pitch = Column(Float, default=1.0)
    audio_filename = Column(String(300), nullable=True)
    duration = Column(Float, default=0.0)          # seconds
    char_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Dependency ───────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    # Check if 'is_admin' column exists in 'users' table, and add it if not
    from sqlalchemy import inspect
    inspector = inspect(engine)
    if inspector.has_table("users"):
        columns = [c['name'] for c in inspector.get_columns('users')]
        if 'is_admin' not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
                print("[OK] Migrated users table: added is_admin column")
