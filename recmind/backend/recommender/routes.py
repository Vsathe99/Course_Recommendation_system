# backend/recommender/routes.py

import os
from fastapi import APIRouter, HTTPException

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


def _normalize_topic(topic: str) -> str:
    return (
        topic.strip()
        .lower()
        .replace(" ", "_")
        .replace("/", "_")
    )


def _run_full_rag_pipeline_for_topic(topic: str) -> None:
    max_per_source = min(settings.MAX_PER_SOURCE, 200)

    safe_topic = _normalize_topic(topic)

    gh_parquet = RAW_GITHUB_DIR / f"{safe_topic}.parquet"
    yt_parquet = RAW_YOUTUBE_DIR / f"{safe_topic}.parquet"

    gh_results = search_repos(topic, max_per_source)
    yt_results = search_videos(topic, max_per_source)

    for repo in gh_results[:5]:
        repo["readme"] = fetch_readme(repo["ext_id"])

    for vid in yt_results[:5]:
        vid["transcript"] = fetch_transcript(vid["ext_id"])

    total = len(gh_results) + len(yt_results)
    if total > 200:
        gh_results = gh_results[:100]
        yt_results = yt_results[:100]

    os.makedirs(gh_parquet.parent, exist_ok=True)
    os.makedirs(yt_parquet.parent, exist_ok=True)

    write_parquet(gh_results, "github", safe_topic)
    write_parquet(yt_results, "youtube", safe_topic)

    faiss_path = FAISS_DIR / f"{safe_topic}.index"
    faiss_path.parent.mkdir(parents=True, exist_ok=True)

    for source in ["github", "youtube"]:
        try:
            build_index(safe_topic, source, faiss_path)
        except FileNotFoundError:
            continue


@router.get("/recommendations")
def recommendations(
    user_id: str,
    topic: str,
    q: str,
    k: int = 10,
    alpha: float = 0.5,
):
    safe_topic = _normalize_topic(topic)

    print("\n================ FAISS DEBUG =================")
    print("RAW topic:", topic)
    print("SAFE topic:", safe_topic)
    print("FAISS_DIR:", FAISS_DIR)

    expected_path = FAISS_DIR / f"{safe_topic}.index"
    print("Expected FAISS path:", expected_path)
    print("Exists:", expected_path.exists())

    print("Files in FAISS_DIR:")
    if FAISS_DIR.exists():
        for f in FAISS_DIR.iterdir():
            print("  -", repr(f.name))
    print("=============================================\n")

    try:
        faiss_store = FaissStore.from_topic(safe_topic)
    except FileNotFoundError:
        _run_full_rag_pipeline_for_topic(topic)
        try:
            faiss_store = FaissStore.from_topic(safe_topic)
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to build FAISS index for topic '{topic}'",
            )

    zs = ZeroShotRanker(faiss_store)
    cf = CFModel(safe_topic, faiss_store)

    ranked = rank_hybrid(
        user_id=user_id,
        topic=safe_topic,
        zero_shot=zs,
        cf_model=cf,
        query=q,
        k=k,
        alpha=alpha,
        use_cf=cf.is_trained(),
    )

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
