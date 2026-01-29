# backend/core/faiss_store.py

import faiss
import numpy as np
from pathlib import Path
from backend.core.paths import FAISS_DIR


def _normalize_topic(topic: str) -> str:
    return (
        topic.strip()
        .lower()
        .replace(" ", "_")
        .replace("/", "_")
    )


class FaissStore:
    def __init__(self, dim: int, path: Path):
        self.dim = dim
        self.path = path
        self.index = faiss.IndexIDMap(faiss.IndexFlatL2(dim))

    @classmethod
    def from_topic(cls, topic: str) -> "FaissStore":
        """
        Read-only / recommend-time usage
        """

        safe_topic = _normalize_topic(topic)
        path = FAISS_DIR / f"{safe_topic}.index"

        if not path.exists():
            raise FileNotFoundError(
                f"FAISS index not found for topic '{topic}' at {path}"
            )

        index = faiss.read_index(str(path))
        dim = index.d

        store = cls(dim=dim, path=path)
        store.index = index
        return store

    def upsert(self, vecs, ids):
        vecs = np.asarray(vecs, dtype="float32")
        ids = np.asarray(ids, dtype="int64")
        self.index.add_with_ids(vecs, ids)

    def search(self, query_vec, k: int):
        query_vec = np.asarray([query_vec], dtype="float32")
        distances, indices = self.index.search(query_vec, k)
        return list(zip(indices[0], distances[0]))

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.path))

    def load(self):
        if self.path.exists():
            self.index = faiss.read_index(str(self.path))
