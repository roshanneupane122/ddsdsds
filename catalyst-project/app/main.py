from fastapi import FastAPI

from app.api.v1.api import api_router

from app.core.exceptions import register_exception_handlers

app = FastAPI(
    title="Catalyst AI",
    description="GIS API Endpoints",
    version="1.0.0",
)

register_exception_handlers(app)
app.include_router(api_router)