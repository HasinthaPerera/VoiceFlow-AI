from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from database import init_db
from routers import auth_router, tts_router, history_router, user_router

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="VoiceFlow AI API",
    description="Backend API for VoiceFlow AI Text-to-Speech SaaS",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()
    print("✅ Database initialized")
    print(f"✅ CORS enabled for: {FRONTEND_URL}")
    print("🚀 VoiceFlow AI Backend is running!")

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(tts_router.router)
app.include_router(history_router.router)
app.include_router(user_router.router)

# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "VoiceFlow AI API is running"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
