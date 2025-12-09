# backend/recommender/cf.py

import os
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import numpy as np
from scipy import sparse
from sklearn.decomposition import PCA
from lightfm import LightFM

from backend.core import db
from backend.core.embedding import embed_texts
from backend.core.faiss_store import FaissStore

MODEL_DIR = "data/models"
os.makedirs(MODEL_DIR, exist_ok=True)


class CFModel:
    """
    LightFM-based collaborative filtering model, per topic.

    - Trains on user-item interaction matrix (click, like, complete, etc.)
    - Uses item content embeddings (from embed_texts) as item features.
    - Model is stored on disk as a pickle per topic.
    """

    def __init__(self, topic: str, faiss_store: FaissStore):
        self.topic = topic
        self.faiss = faiss_store

        self.model: Optional[LightFM] = None
        self.pca: Optional[PCA] = None
        self.user_index: Dict[str, int] = {}
        self.item_index: Dict[str, int] = {}
        self.rev_item_index: List[str] = []  # index → item_id

    # -------------------------
    # Paths & status helpers
    # -------------------------

    def _model_path(self) -> str:
        safe = self.topic.replace("/", "_")
        return os.path.join(MODEL_DIR, f"lightfm_{safe}.pkl")

    def is_trained(self) -> bool:
        """Return True if there is a saved model for this topic."""
        return os.path.exists(self._model_path())

    def is_stale(self, days: int = 15) -> bool:
        """
        Return True if the saved model file exists and its mtime is older than `days`.
        Used so the API can decide when to retrain in the background.
        """
        path = self._model_path()
        if not os.path.exists(path):
            return False
        mtime = datetime.utcfromtimestamp(os.path.getmtime(path))
        return datetime.utcnow() - mtime > timedelta(days=days)

    # -------------------------
    # Data preparation
    # -------------------------

    def _load_interactions(self):
        """
        Build user-item interaction matrix (LightFM input) from MongoDB.
        Returns:
            X      : scipy.sparse matrix (num_users x num_items)
            uidx   : {user_id -> row index}
            iidx   : {item_id -> col index}
            item_ids: list of item_ids in column order
        """
        inters = db.get_interactions_by_topic(self.topic)
        items = db.get_items_by_topic(self.topic)

        item_ids = [str(it["_id"]) for it in items]
        users = sorted({i["user_id"] for i in inters})

        uidx = {u: i for i, u in enumerate(users)}
        iidx = {iid: i for i, iid in enumerate(item_ids)}

        rows, cols, vals = [], [], []

        # simple event → weight mapping
        wmap = {
            "impression": 0.1,
            "click": 1,
            "like": 2,
            "complete": 3,
        }

        for r in inters:
            item_id_str = str(r["item_id"])
            if item_id_str in iidx:
                rows.append(uidx[r["user_id"]])
                cols.append(iidx[item_id_str])
                vals.append(wmap.get(r["event"], 1))

        X = sparse.coo_matrix(
            (vals, (rows, cols)),
            shape=(len(users) or 1, len(item_ids)),
        )

        return X, uidx, iidx, item_ids

    def _build_item_features(self, item_ids: List[str]) -> sparse.csr_matrix:
        """
        Build item feature matrix using content embeddings (title + desc),
        then compress with PCA for LightFM.
        """
        items = db.get_items_by_ids(item_ids)

        texts = [
            f"{it.get('title', '')} {it.get('desc', '')}"
            for it in items
        ]

        # Embedding matrix: shape (num_items, embed_dim)
        vecs = embed_texts(texts)

        # Reduce dimensionality for LightFM
        k = min(50, vecs.shape[1])
        self.pca = PCA(n_components=k, random_state=42)
        feats = self.pca.fit_transform(vecs)

        return sparse.csr_matrix(feats)

    # -------------------------
    # Train / save / load
    # -------------------------

    def fit(self):
        """
        Train LightFM on current interactions for this topic,
        with item content features. Overwrites any existing model on disk.
        """
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
        with open(self._model_path(), "wb") as f:
            pickle.dump(payload, f)

    def load(self) -> bool:
        """
        Load a previously saved model for this topic.
        Returns True if load was successful, False otherwise.
        """
        path = self._model_path()
        if not os.path.exists(path):
            return False

        with open(path, "rb") as f:
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

    def predict(self, user_id: str, candidate_ids: List[str]) -> Optional[Dict[str, float]]:
        """
        Predict scores for given candidate item IDs for a user.

        - If no trained model exists → returns None (so caller can fall back to RAG only).
        - If trained model exists but no candidate IDs overlap with known items → returns None.
        """
        # Ensure model is loaded
        if self.model is None:
            if not self.load():
                # No trained model on disk for this topic
                return None

        # Build item feature matrix for all items the model knows (rev_item_index)
        items = db.get_items_by_ids(self.rev_item_index)
        texts = [
            f"{it.get('title', '')} {it.get('desc', '')}"
            for it in items
        ]
        vecs = embed_texts(texts)
        item_features = sparse.csr_matrix(self.pca.transform(vecs))

        # Map user_id to model index (unseen users get new index)
        uidx = self.user_index.get(user_id, len(self.user_index))

        # Map candidate IDs to indices used by model
        idxs = [self.item_index.get(cid) for cid in candidate_ids if cid in self.item_index]

        if not idxs:
            # None of the candidates are in the CF model's item_index
            return None

        scores = self.model.predict(
            uidx,
            np.array(idxs, dtype=np.int32),
            item_features=item_features,
        )

        out: Dict[str, float] = {}
        j = 0
        for cid in candidate_ids:
            if cid in self.item_index:
                out[cid] = float(scores[j])
                j += 1
            else:
                # candidate not present in CF model – leave it without CF score
                out[cid] = 0.0

        return out
