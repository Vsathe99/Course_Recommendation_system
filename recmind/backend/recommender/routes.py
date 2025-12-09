from fastapi import APIRouter, Query
from backend.core import db
from backend.ingestion import github_client, youtube_client
from backend.recommender.builder import build_index
from backend.core.faiss_store import FaissStore
from backend.recommender.zero_shot import ZeroShotRanker
from backend.recommender.cf import CFModel
from backend.recommender.rank import rank_hybrid

router = APIRouter(prefix="", tags=["recommendations"])


@router.get("/recommendations")
def recommendations(
    user_id: str,
    topic: str,
    q: str,
    k: int = 10,
    alpha: float = 0.5,
):
    # --- ensure FAISS index / RAG exists for this topic ---
    try:
        faiss = FaissStore(topic)
    except FileNotFoundError:
        github_client.search_repos(topic)
        youtube_client.search_videos(topic)
        build_index(topic)
        faiss = FaissStore(topic)

    zs = ZeroShotRanker(faiss)
    cf = CFModel(topic, faiss)

    # use CF only if a trained model exists
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

    items = db.get_items_by_ids([iid for iid, _ in ranked])
    id_map = {str(it["_id"]): it for it in items}

    return [
        {
            "title": id_map[str(i)]["title"],
            "url": id_map[str(i)]["url"],
            "source": id_map[str(i)]["source"],
            "score": s,
            "used_cf": use_cf,
        }
        for i, s in ranked
        if str(i) in id_map
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


# ✅ MANUAL CF TRAINING ENDPOINT
@router.post("/train_cf")
def train_cf(topic: str):
    """
    Manually train/retrain CF model for a given topic.

    Flow you get:
    - User has already used this topic in /recommendations (so items + FAISS index exist).
    - Users have generated interactions via /interactions.
    - You call /train_cf?topic=... whenever you decide it's time.

    After training:
    - /recommendations for this topic will start using hybrid (CF + RAG) automatically.
    """
    # 1. Ensure FAISS index exists for this topic.
    #    If not, tell caller to build it first.
    try:
        faiss = FaissStore(topic)
    except FileNotFoundError:
        return {
            "ok": False,
            "topic": topic,
            "detail": (
                f"No FAISS index found for topic '{topic}'. "
                "Hit /recommendations or /build_index for this topic first "
                "to create the RAG index."
            ),
        }

    # 2. Train CF on existing interactions for this topic
    cf = CFModel(topic, faiss)
    cf.fit()

    return {
        "ok": True,
        "topic": topic,
        "detail": "CF model trained successfully for this topic.",
    }
