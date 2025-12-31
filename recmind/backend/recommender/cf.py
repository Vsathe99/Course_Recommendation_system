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

# ensure directory exists
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

    def _load_interactions(self):
        inters = db.get_interactions_by_topic(self.topic)
        items = db.get_items_by_topic(self.topic)

        item_ids = [str(it["_id"]) for it in items]
        users = sorted({i["user_id"] for i in inters})

        uidx = {u: i for i, u in enumerate(users)}
        iidx = {iid: i for i, iid in enumerate(item_ids)}

        rows, cols, vals = [], [], []

        wmap = {
            "impression": 0.1,
            "click": 1,
            "like": 2,
            "complete": 3,
        }

        for r in inters:
            iid = str(r["item_id"])
            if iid in iidx:
                rows.append(uidx[r["user_id"]])
                cols.append(iidx[iid])
                vals.append(wmap.get(r["event"], 1))

        X = sparse.coo_matrix(
            (vals, (rows, cols)),
            shape=(len(users) or 1, len(item_ids)),
        )

        return X, uidx, iidx, item_ids

    def _build_item_features(self, item_ids: List[str]) -> sparse.csr_matrix:
        items = db.get_items_by_ids(item_ids)

        texts = [
            f"{it.get('title', '')} {it.get('desc', '')}"
            for it in items
        ]

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

        item_features = self._build_item_features(item_ids)

        self.model = LightFM(
            loss="warp",
            no_components=64,
            random_state=42,
        )

        self.model.fit(
            X.tocsr(),
            item_features=item_features,
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

        items = db.get_items_by_ids(self.rev_item_index)
        texts = [
            f"{it.get('title', '')} {it.get('desc', '')}"
            for it in items
        ]

        vecs = embed_texts(texts)
        item_features = sparse.csr_matrix(self.pca.transform(vecs))

        uidx = self.user_index.get(user_id, len(self.user_index))

        idxs = [
            self.item_index[cid]
            for cid in candidate_ids
            if cid in self.item_index
        ]

        if not idxs:
            return None

        scores = self.model.predict(
            uidx,
            np.array(idxs, dtype=np.int32),
            item_features=item_features,
        )

        return {
            cid: float(scores[i]) if cid in self.item_index else 0.0
            for i, cid in enumerate(candidate_ids)
        }
