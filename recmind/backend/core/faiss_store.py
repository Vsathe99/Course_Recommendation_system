# backend/core/faiss_store.py

import faiss
import numpy as np
import os


class FaissStore:
    def __init__(self, dim: int, path: str):
        self.dim = dim
        self.path = path
        # fresh index (used when building or extending)
        self.index = faiss.IndexIDMap(faiss.IndexFlatL2(dim))

    @classmethod
    def from_topic(cls, topic: str, base_dir: str = "data/faiss") -> "FaissStore":
        """
        Convenience constructor for read-only / recommend-time usage:
        loads an existing FAISS index from data/faiss/{topic}.index
        """
        path = os.path.join(base_dir, f"{topic}.index")
        if not os.path.exists(path):
            raise FileNotFoundError(f"FAISS index not found for topic '{topic}' at {path}")

        index = faiss.read_index(path)
        dim = index.d

        store = cls(dim=dim, path=path)
        store.index = index
        return store

    def upsert(self, vecs, ids):
        vecs = np.array(vecs).astype("float32")
        ids = np.array(ids).astype("int64")
        self.index.add_with_ids(vecs, ids)

    def search(self, query_vec, k):
        query_vec = np.array([query_vec]).astype("float32")
        distances, indices = self.index.search(query_vec, k)
        return list(zip(indices[0], distances[0]))

    def save(self):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        faiss.write_index(self.index, self.path)

    def load(self):
        if os.path.exists(self.path):
            self.index = faiss.read_index(self.path)
