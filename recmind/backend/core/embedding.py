# backend/core/embedding.py
import os
import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer

# You can pick any free Hugging Face model here
# Some good options:
# - "all-MiniLM-L6-v2" (fast, small, 384-dim)
# - "multi-qa-MiniLM-L6-cos-v1" (QA-focused)
# - "paraphrase-MiniLM-L6-v2" (semantic similarity)
# - "intfloat/e5-base-v2" (state-of-the-art general embedding model)

MODEL_NAME = os.getenv("HF_EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Load model once at startup
model = SentenceTransformer(MODEL_NAME)

def embed_texts(texts: List[str]) -> np.ndarray:
    """Embed a list of texts using a Hugging Face SentenceTransformer model."""
    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return embeddings.astype("float32")
