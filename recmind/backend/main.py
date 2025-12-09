from fastapi import FastAPI, Query
from backend.config import get_settings
from backend.ingestion.github_client import search_repos, fetch_readme
from backend.ingestion.youtube_client import search_videos, fetch_transcript
from backend.core.utils import write_parquet
from backend.recommender.search import search
from backend.recommender.builder import build_index
import asyncio
import concurrent.futures
from backend.recommender.routes import router as rec_router

settings = get_settings()
app = FastAPI(title="recmind-ingestion")


@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/ingest")
async def ingest(topic: str = Query(..., min_length=1)):
    max_per_source = min(settings.MAX_PER_SOURCE, 200)
    loop = asyncio.get_event_loop()

    # Run GitHub and YouTube searches in parallel
    with concurrent.futures.ThreadPoolExecutor() as pool:
        gh_future = loop.run_in_executor(pool, search_repos, topic, max_per_source)
        yt_future = loop.run_in_executor(pool, search_videos, topic, max_per_source)
        gh_results, yt_results = await asyncio.gather(gh_future, yt_future)

    # Fetch README for top 5 GitHub repos
    for repo in gh_results[:5]:
        repo["readme"] = fetch_readme(repo["ext_id"])

    # Fetch transcript for top 5 YouTube videos
    for vid in yt_results[:5]:
        vid["transcript"] = fetch_transcript(vid["ext_id"])

    # Limit results if total exceeds 400
    total = len(gh_results) + len(yt_results)
    if total > 200:
        gh_results = gh_results[:100]
        yt_results = yt_results[:100]

    # Write results to Parquet files
    gh_path = write_parquet(gh_results, "github", topic)
    yt_path = write_parquet(yt_results, "youtube", topic)

    return {
        "github_rows": len(gh_results),
        "github_path": gh_path,
        "youtube_rows": len(yt_results),
        "youtube_path": yt_path,
    }

@app.post("/build_index")
def build_index_api(topic: str, source: str):
    
    faiss_path = f"data/faiss/{topic}.index"
    count = build_index(topic, source, faiss_path)
    return {"topic": topic, "source": source, "indexed": count}

@app.get("/search")
def search_api(topic: str, q: str, k: int = 20):
    
    faiss_path = f"data/faiss/{topic}.index"
    results = search(topic, q, k, faiss_path)
    # Return simplified structure for frontend
    return [
        {
            "title": r["metadata"].get("title", "Untitled"),
            "desc": r["metadata"].get("desc", ""),
            "url": r["metadata"].get("url", ""),
            "source": r["metadata"].get("source", ""),
            "topic": r["metadata"].get("topic", ""),
            "score": round(r["score"], 5),
        }
        for r in results
    ]

app.include_router(rec_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
