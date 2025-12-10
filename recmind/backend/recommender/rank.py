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
    use_cf: bool = True,
):
    """
    Combine zero-shot (RAG) and CF scores.

    - zero_shot.score_items returns: Dict[mongo_item_id (str) -> score]
    - cf_model.predict returns: Optional[Dict[mongo_item_id (str) -> score]]

    Returns:
        List[(mongo_item_id (str), score)] sorted desc.
    """
    # 1. Always compute zero-shot / RAG scores
    zs = zero_shot.score_items(topic, query, k * 5)  # dict[id_str -> score]

    if not zs:
        return []

    # If CF is disabled, just return RAG-only ranking
    if not use_cf:
        return sorted(zs.items(), key=lambda x: x[1], reverse=True)[:k]

    # 2. Get CF scores for these candidates
    candidate_ids = list(zs.keys())
    cf_scores = cf_model.predict(user_id, candidate_ids)

    # If CF model not trained or returned nothing → RAG-only
    if not cf_scores:
        return sorted(zs.items(), key=lambda x: x[1], reverse=True)[:k]

    # 3. Combine RAG + CF
    final = {
        iid: alpha * cf_scores.get(iid, 0.0) + (1 - alpha) * zs[iid]
        for iid in zs
    }

    return sorted(final.items(), key=lambda x: x[1], reverse=True)[:k]
