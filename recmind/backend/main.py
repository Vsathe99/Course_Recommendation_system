from fastapi import FastAPI
from backend.recommender.routes import router as rec_router
from backend.api import router as ml_router
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="recmind-ingestion")

# Dev-only CORS
if os.getenv("ENV") != "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 🔑 ML API
app.include_router(ml_router, prefix="/api/ml", tags=["ml"])

# 🔑 Recommender routes (also under /api/ml)
app.include_router(rec_router, prefix="/api/ml/recommend", tags=["recommend"])
