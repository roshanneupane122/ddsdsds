from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.v1.api import api_router
from app.core.exceptions import register_exception_handlers
from app.services.ml_inference import ml_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup
    print("Initializing ML models...")
    ml_service.load_models()
    yield
    # Clean up on shutdown if needed
    print("Shutting down...")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Catalyst AI",
    description="GIS API Endpoints",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router)