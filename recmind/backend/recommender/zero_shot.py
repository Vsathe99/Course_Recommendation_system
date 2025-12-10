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
    - Returns a dict {mongo_item_id (str): score}.
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
        - Search FAISS for top-k most similar items (numeric IDs)
        - Map numeric IDs -> Mongo docs
        - Combine embedding score + popularity into a final score

        Returns:
            Dict[mongo_item_id (str), score (float)]
        """
        # 1. Embed the query (shape: (embed_dim,))
        qvec = embed_texts([query])[0]

        # 2. Search FAISS index: returns list of (faiss_numeric_id, distance)
        results = self.faiss.search(qvec, k=k)
        if not results:
            return {}

        # Filter out invalid slots (-1, max_float)
        filtered: List[tuple[int, float]] = [
            (int(i), float(d))
            for i, d in results
            if i != -1
        ]
        if not filtered:
            return {}

        # 3. Resolve numeric_id -> Mongo doc
        # (we'll use your existing helper get_item_by_numeric_id)
        sims = []
        pops = []
        mongo_ids: List[str] = []

        for num_id, dist in filtered:
            doc = db.get_item_by_numeric_id(num_id)
            if not doc:
                continue
            if doc.get("topic") != topic:
                continue

            mongo_id_str = str(doc["_id"])
            mongo_ids.append(mongo_id_str)

            # FAISS gives L2 distance: smaller is better.
            # Convert to similarity by negating distance.
            sims.append(-float(dist))

            # Popularity from doc (stars / viewCount)
            pops.append(float(doc.get("popularity", 0.0)))

        if not mongo_ids:
            return {}

        sims = np.array(sims, dtype=float)
        pops = np.array(pops, dtype=float)

        # 4. Normalize popularity to [0, 1]
        pops_norm = _minmax(pops)

        # 5. Final zero-shot score (higher is better)
        # You could also min-max sims, but negating distance already helps.
        zs = self.w1 * sims + self.w2 * pops_norm

        return {mongo_ids[i]: float(zs[i]) for i in range(len(mongo_ids))}
