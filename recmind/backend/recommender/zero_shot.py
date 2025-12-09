# backend/recommender/zero_shot.py

from typing import Dict, List
import numpy as np

from backend.core import db
from backend.core.embedding import embed_texts
from backend.core.faiss_store import FaissStore


def _minmax(x: np.ndarray) -> np.ndarray:
    """
    Simple min-max scaling to [0, 1].
    If array is empty, returns it unchanged.
    """
    if x.size == 0:
        return x
    return (x - np.min(x)) / (np.ptp(x) + 1e-8)


class ZeroShotRanker:
    """
    Zero-shot / content-based ranker.

    - Uses FAISS to get top-k candidates by vector similarity.
    - Optionally mixes in a simple popularity score from Mongo.
    - Returns a dict {item_id: score}.
    """

    def __init__(self, faiss_store: FaissStore, w1: float = 1.0, w2: float = 0.2):
        """
        Args:
            faiss_store: FaissStore for a given topic (already built).
            w1: weight for embedding similarity score.
            w2: weight for popularity score.
        """
        self.faiss = faiss_store
        self.w1 = w1
        self.w2 = w2

    def score_items(
        self,
        topic: str,
        query: str,
        k: int = 100,
    ) -> Dict[str, float]:
        """
        Score items for a given user query within a topic.

        Steps:
        - Embed query
        - Search FAISS for top-k most similar items
        - Fetch those items from Mongo
        - Combine embedding score + popularity into a final score

        Returns:
            Dict[item_id (str), score (float)]
        """
        # 1. Embed the query (shape: (embed_dim,))
        qvec = embed_texts([query])[0]

        # 2. Search FAISS index: returns list of (item_id, similarity_score)
        results = self.faiss.search(qvec, k=k)
        if not results:
            return {}

        item_ids: List[str] = [r[0] for r in results]

        # 3. Fetch items from DB (for popularity, titles, etc.)
        items = db.get_items_by_ids(item_ids)
        if not items:
            # No metadata found – just return embedding scores
            return {item_ids[i]: float(results[i][1]) for i in range(len(item_ids))}

        # Map id → item for quick lookup
        item_map = {str(it["_id"]): it for it in items}

        # 4. Build arrays for popularity & embedding sim
        sims = []
        pops = []

        filtered_ids: List[str] = []
        for iid, sim in results:
            doc = item_map.get(str(iid))
            if not doc:
                continue
            filtered_ids.append(str(iid))
            sims.append(float(sim))
            pops.append(float(doc.get("popularity", 0.0)))

        if not filtered_ids:
            return {}

        sims = np.array(sims, dtype=float)
        pops = np.array(pops, dtype=float)

        # 5. Normalize popularity to [0, 1]
        pops_norm = _minmax(pops)

        # 6. Final zero-shot score
        zs = self.w1 * sims + self.w2 * pops_norm

        return {filtered_ids[i]: float(zs[i]) for i in range(len(filtered_ids))}
