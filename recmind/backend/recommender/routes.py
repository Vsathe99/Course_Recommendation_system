# backend/recommender/routes.py

import os
from fastapi import APIRouter, Query, HTTPException

from backend.config import get_settings
from backend.core import db
from backend.core.utils import write_parquet
from backend.core.faiss_store import FaissStore

from backend.ingestion.github_client import search_repos, fetch_readme
from backend.ingestion.youtube_client import search_videos, fetch_transcript

from backend.recommender.builder import build_index
from backend.recommender.zero_shot import ZeroShotRanker
from backend.recommender.cf import CFModel
from backend.recommender.rank import rank_hybrid 
from backend.core.paths import (
    RAW_GITHUB_DIR,
    RAW_YOUTUBE_DIR,
    FAISS_DIR,
)


router = APIRouter(prefix="", tags=["recommendations"])
settings = get_settings()


def _run_full_rag_pipeline_for_topic(topic: str) -> None:
    """
    1) Ingest GitHub + YouTube for this topic (if parquet not already there)
    2) Build/extend FAISS index for this topic from BOTH sources
    """

    # --------- 1) INGEST (GitHub + YouTube) ----------
    max_per_source = min(settings.MAX_PER_SOURCE, 200)

    # If parquet already exists, you *could* skip ingestion.
    # Here we always re-ingest for simplicity. If you want to skip
    # when existing, uncomment the early-return section.

    gh_parquet = RAW_GITHUB_DIR / f"{topic}.parquet"
    yt_parquet = RAW_YOUTUBE_DIR / f"{topic}.parquet" 
    
    gh_results = search_repos(topic, max_per_source)
    yt_results = search_videos(topic, max_per_source)

    # Fetch README for top 5 GitHub repos
    for repo in gh_results[:5]:
        repo["readme"] = fetch_readme(repo["ext_id"])

    # Fetch transcript for top 5 YouTube videos
    for vid in yt_results[:5]:
        vid["transcript"] = fetch_transcript(vid["ext_id"])

    # Limit results if total exceeds 200
    total = len(gh_results) + len(yt_results)
    if total > 200:
        gh_results = gh_results[:100]
        yt_results = yt_results[:100]

    # Write results to Parquet files
    os.makedirs(os.path.dirname(gh_parquet), exist_ok=True)
    os.makedirs(os.path.dirname(yt_parquet), exist_ok=True)

    write_parquet(gh_results, "github", topic)
    write_parquet(yt_results, "youtube", topic)

    # --------- 2) BUILD / EXTEND FAISS INDEX ----------
    
    faiss_path = FAISS_DIR / f"{topic}.index"
    os.makedirs(os.path.dirname(faiss_path), exist_ok=True)

    # Build from both sources into a single index file
    for source in ["github", "youtube"]:
        try:
            build_index(topic, source, faiss_path)
        except FileNotFoundError:
            # If one source has no parquet/data, just skip
            continue


from pathlib import Path
from backend.core.paths import FAISS_DIR

@router.get("/recommendations")
def recommendations(
    user_id: str,
    topic: str,
    q: str,
    k: int = 10,
    alpha: float = 0.5,
):
    print("\n================ FAISS DEBUG =================")
    print("RAW topic:", topic)
    print("repr(topic):", repr(topic))
    print("FAISS_DIR:", FAISS_DIR)

    expected_path = FAISS_DIR / f"{topic}.index"
    print("Expected FAISS path (raw):", expected_path)
    print("Exists (raw):", expected_path.exists())

    print("Files in FAISS_DIR:")
    for f in FAISS_DIR.iterdir():
        print("  -", repr(f.name))
    print("=============================================\n")

    # --- try to load existing FAISS index for this topic ---
    try:
        faiss_store = FaissStore.from_topic(topic)
        print("✅ FAISS LOADED")
        print("FAISS index path:", faiss_store.path)
        print("Index dim:", faiss_store.index.d)
        print("Total vectors:", faiss_store.index.ntotal)
    except FileNotFoundError as e:
        print("❌ FAISS NOT FOUND:", e)
        print("➡️ Running ingestion + build_index...")
        _run_full_rag_pipeline_for_topic(topic)

        try:
            faiss_store = FaissStore.from_topic(topic)
            print("✅ FAISS LOADED AFTER BUILD")
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Failed to build FAISS index for topic '{topic}'. "
                    "Check ingestion and build_index pipeline."
                ),
            )

    # ---- Now we definitely have a FAISS store ----
    zs = ZeroShotRanker(faiss_store)
    cf = CFModel(topic, faiss_store)

    print("CF model path:", cf._model_path())
    print("CF trained:", cf.is_trained())

    ranked = rank_hybrid(
        user_id=user_id,
        topic=topic,
        zero_shot=zs,
        cf_model=cf,
        query=q,
        k=k,
        alpha=alpha,
        use_cf=cf.is_trained(),
    )

    print("DEBUG ranked:", ranked)

    item_ids = [iid for iid, _ in ranked]
    items = db.get_items_by_ids(item_ids)

    id_map = {str(it["_id"]): it for it in items}

    return [
        {
            "id": str(id_map[i]["_id"]),
            "title": id_map[i]["title"],
            "url": id_map[i]["url"],
            "source": id_map[i]["source"],
            "desc": id_map[i].get("desc", ""),
            "score": s,
            "used_cf": cf.is_trained(),
        }
        for i, s in ranked
        if i in id_map
    ]



@router.post("/interactions")
def add_interaction(
    user_id: str,
    item_id: str,
    event: str,
    dwell_time_ms: int | None = None,
):
    db.log_interaction(user_id, item_id, event, dwell_time_ms)
    return {"ok": True}



