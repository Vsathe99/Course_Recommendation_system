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

    gh_parquet = f"data/raw/github/{topic}.parquet"
    yt_parquet = f"data/raw/youtube/{topic}.parquet"

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
    faiss_path = f"data/faiss/{topic}.index"
    os.makedirs(os.path.dirname(faiss_path), exist_ok=True)

    # Build from both sources into a single index file
    for source in ["github", "youtube"]:
        try:
            build_index(topic, source, faiss_path)
        except FileNotFoundError:
            # If one source has no parquet/data, just skip
            continue


@router.get("/recommendations")
def recommendations(
    user_id: str,
    topic: str,
    q: str,
    k: int = 10,
    alpha: float = 0.5,
):
    """
    If FAISS index for this topic exists:
        → load it and serve recommendations.

    If FAISS index does NOT exist:
        → automatically run:
            1) Ingest (GitHub + YouTube)
            2) Build index (both sources)
            3) Load FAISS and serve recommendations.
    """

    # --- try to load existing FAISS index for this topic ---
    try:
        faiss_store = FaissStore.from_topic(topic)
    except FileNotFoundError:
        # No index yet → run full RAG pipeline and then try again
        _run_full_rag_pipeline_for_topic(topic)

        # Try loading again; if it still fails, raise an error
        try:
            faiss_store = FaissStore.from_topic(topic)
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
    print("zs:", zs)

    use_cf = cf.is_trained()

    ranked = rank_hybrid(
        user_id=user_id,
        topic=topic,
        zero_shot=zs,
        cf_model=cf,
        query=q,
        k=k,
        alpha=alpha,
        use_cf=use_cf,
    )

    print("DEBUG ranked:", ranked)

    item_ids = [iid for iid, _ in ranked]  # these are Mongo _id strings
    items = db.get_items_by_ids(item_ids)

    id_map = {str(it["_id"]): it for it in items}

    return [
        {
            "title": id_map[i]["title"],
            "url": id_map[i]["url"],
            "source": id_map[i]["source"],
            "score": s,
            "used_cf": use_cf,
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


@router.post("/train_cf")
def train_cf(topic: str):
    """
    Manually train/retrain CF model for a given topic.
    """
    try:
        faiss_store = FaissStore.from_topic(topic)
    except FileNotFoundError:
        return {
            "ok": False,
            "topic": topic,
            "detail": (
                f"No FAISS index found for topic '{topic}'. "
                "Trigger /recommendations at least once (which will auto-run "
                "ingest + index) or run /ingest + /build_index manually."
            ),
        }

    cf = CFModel(topic, faiss_store)
    cf.fit()

    return {
        "ok": True,
        "topic": topic,
        "detail": "CF model trained successfully for this topic.",
    }
