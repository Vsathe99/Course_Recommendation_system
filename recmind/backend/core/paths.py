from backend.config import get_settings

settings = get_settings()

RAW_GITHUB_DIR = settings.RAW_DATA_DIR / "github"
RAW_YOUTUBE_DIR = settings.RAW_DATA_DIR / "youtube"
FAISS_DIR = settings.FAISS_DIR
MODEL_DIR = settings.MODEL_DIR

# Ensure dirs exist (safe)
for p in [RAW_GITHUB_DIR, RAW_YOUTUBE_DIR, FAISS_DIR, MODEL_DIR]:
    p.mkdir(parents=True, exist_ok=True)
