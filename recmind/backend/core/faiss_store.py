import faiss
import numpy as np
import os

class FaissStore:
    def __init__(self, dim, path):
        self.dim = dim
        self.path = path
        self.index = faiss.IndexIDMap(faiss.IndexFlatL2(dim))  # ✅ wrap with IDMap

    def upsert(self, vecs, ids):
        vecs = np.array(vecs).astype('float32')
        ids = np.array(ids).astype('int64')
        self.index.add_with_ids(vecs, ids)

    def search(self, query_vec, k):
        query_vec = np.array([query_vec]).astype('float32')
        distances, indices = self.index.search(query_vec, k)
        return list(zip(indices[0], distances[0]))

    def save(self):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        faiss.write_index(self.index, self.path)

    def load(self):
        if os.path.exists(self.path):
            self.index = faiss.read_index(self.path)
