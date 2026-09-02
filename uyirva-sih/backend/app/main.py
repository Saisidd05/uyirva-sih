from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .api import auth, farmer, buyer
from .db import engine
from .db.base import Base
from . import models  # Register all ORM models before creating tables.


@asynccontextmanager
async def lifespan(_: FastAPI):
    # A new installation has no migration runner yet, so create the minimal
    # schema needed by authentication before accepting requests.
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG_ENABLED, lifespan=lifespan)

# CORS configuration (allow all for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(farmer.router, prefix="/api/farmer", tags=["farmer"])
app.include_router(buyer.router, prefix="/api/buyer", tags=["buyer"])
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# Serve the multi-file frontend from FastAPI so UI and API share one local
# origin during development.
frontend_dir = Path(__file__).resolve().parents[2] / "frontend"

@app.get("/", include_in_schema=False)
async def frontend():
    return FileResponse(frontend_dir / "index.html")

app.mount("/", StaticFiles(directory=frontend_dir), name="frontend-assets")
