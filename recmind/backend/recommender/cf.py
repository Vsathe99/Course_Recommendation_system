# backend/recommender/cf.py

import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

import numpy as np
from scipy import sparse
from sklearn.decomposition import PCA
from lightfm import LightFM

from backend.core import db
from backend.core.embedding import embed_texts
from backend.core.faiss_store import FaissStore
from backend.core.paths import MODEL_DIR

MODEL_DIR.mkdir(parents=True, exist_ok=True)


class CFModel:
    """
    LightFM-based collaborative filtering model, per topic.
    """

    def __init__(self, topic: str, faiss_store: FaissStore):
        self.topic = topic
        self.faiss = faiss_store

        self.model: Optional[LightFM] = None
        self.pca: Optional[PCA] = None
        self.item_features: Optional[sparse.csr_matrix] = None

        self.user_index: Dict[str, int] = {}
        self.item_index: Dict[str, int] = {}
        self.rev_item_index: List[str] = []

    # -------------------------
    # Paths & status helpers
    # -------------------------

    def _model_path(self) -> Path:
        safe = self.topic.replace("/", "_")
        return MODEL_DIR / f"{safe}.pkl"

    def is_trained(self) -> bool:
        return self._model_path().exists()

    def is_stale(self, days: int = 15) -> bool:
        path = self._model_path()
        if not path.exists():
            return False
        mtime = datetime.utcfromtimestamp(path.stat().st_mtime)
        return datetime.utcnow() - mtime > timedelta(days=days)

    # -------------------------
    # Data preparation
    # -------------------------

    def _interaction_weight(self, r: dict) -> float:
        weight = 0.0
        if r.get("liked") is True:
            weight += 2.0
        if r.get("saved") is True:
            weight += 2.5
        if "rating" in r and isinstance(r["rating"], (int, float)):
            weight += float(r["rating"])
        if weight == 0.0:
            weight = 1.0
        return weight

    def _load_interactions(self):
        inters = db.get_interactions_by_topic(self.topic)
        items = db.get_items_by_topic(self.topic)

        item_ids = [str(it["_id"]) for it in items]
        users = sorted({i["user_id"] for i in inters})

        uidx = {u: i for i, u in enumerate(users)}
        iidx = {iid: i for i, iid in enumerate(item_ids)}

        rows, cols, vals = [], [], []

        for r in inters:
            iid = str(r["item_id"])
            uid = r["user_id"]
            if iid in iidx and uid in uidx:
                rows.append(uidx[uid])
                cols.append(iidx[iid])
                vals.append(self._interaction_weight(r))

        X = sparse.coo_matrix(
            (vals, (rows, cols)),
            shape=(len(users) or 1, len(item_ids)),
        )

        return X, uidx, iidx, item_ids

    def _build_item_features(self, item_ids: List[str]) -> sparse.csr_matrix:
        items = db.get_items_by_ids(item_ids)
        texts = [f"{it.get('title', '')} {it.get('desc', '')}" for it in items]

        vecs = embed_texts(texts)

        k = min(50, vecs.shape[1])
        self.pca = PCA(n_components=k, random_state=42)
        feats = self.pca.fit_transform(vecs)

        return sparse.csr_matrix(feats)

    # -------------------------
    # Train / save / load
    # -------------------------

    def fit(self):
        X, uidx, iidx, item_ids = self._load_interactions()

        self.user_index = uidx
        self.item_index = iidx
        self.rev_item_index = item_ids

        self.item_features = self._build_item_features(item_ids)

        self.model = LightFM(
            loss="warp",
            no_components=64,
            random_state=42,
        )

        self.model.fit(
            X.tocsr(),
            item_features=self.item_features,
            epochs=15,
            num_threads=4,
        )

        self._save()

    def _save(self):
        payload = {
            "topic": self.topic,
            "model": self.model,
            "user_index": self.user_index,
            "item_index": self.item_index,
            "rev_item_index": self.rev_item_index,
            "pca": self.pca,
            "item_features": self.item_features,
        }

        with self._model_path().open("wb") as f:
            pickle.dump(payload, f)

    def load(self) -> bool:
        path = self._model_path()
        if not path.exists():
            return False

        with path.open("rb") as f:
            p = pickle.load(f)

        self.topic = p["topic"]
        self.model = p["model"]
        self.user_index = p["user_index"]
        self.item_index = p["item_index"]
        self.rev_item_index = p["rev_item_index"]
        self.pca = p["pca"]
        self.item_features = p["item_features"]

        return True

    # -------------------------
    # Predict
    # -------------------------

    def predict(
        self,
        user_id: str,
        candidate_ids: List[str],
    ) -> Optional[Dict[str, float]]:

        if self.model is None and not self.load():
            return None

        if user_id not in self.user_index:
            return None  # cold-start user → fallback to RAG

        uidx = self.user_index[user_id]

        valid_pairs = [
            (cid, self.item_index[cid])
            for cid in candidate_ids
            if cid in self.item_index
        ]

        if not valid_pairs:
            return None

        cids, idxs = zip(*valid_pairs)

        scores = self.model.predict(
            uidx,
            np.array(idxs, dtype=np.int32),
            item_features=self.item_features,
        )

        return {cid: float(score) for cid, score in zip(cids, scores)}
