from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_db
from routers import auth_router, tts_router, history_router, user_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("✅ Database initialized")
    print("🚀 VoiceFlow AI Backend is running!")
    yield
    # Shutdown (nothing needed)

app = FastAPI(
    title="VoiceFlow AI API",
    description="Backend API for VoiceFlow AI Text-to-Speech SaaS",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
