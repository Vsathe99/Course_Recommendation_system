# backend/recommender/rank.py

from backend.recommender.zero_shot import ZeroShotRanker
from backend.recommender.cf import CFModel

def rank_hybrid(
    user_id,
    topic,
    zero_shot: ZeroShotRanker,
    cf_model: CFModel,
    query: str,
    k: int = 20,
    alpha: float = 0.5,
    use_cf: bool = True,   # ✅ new flag
):
    # Always compute zero-shot / RAG scores
    zs = zero_shot.score_items(topic, query, k * 5)

    # If CF is disabled or not available, just return RAG-only ranking
    if not use_cf:
        return sorted(zs.items(), key=lambda x: x[1], reverse=True)[:k]

    cf_scores = cf_model.predict(user_id, list(zs.keys()))

    # If CF model not trained or returned nothing → RAG-only
    if cf_scores is None:
        return sorted(zs.items(), key=lambda x: x[1], reverse=True)[:k]

    final = {
        iid: alpha * cf_scores.get(iid, 0.0) + (1 - alpha) * zs[iid]
        for iid in zs
    }
    return sorted(final.items(), key=lambda x: x[1], reverse=True)[:k]
