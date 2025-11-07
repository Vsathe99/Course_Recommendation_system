from backend.core.embedding import embed_texts
from backend.core.faiss_store import FaissStore
from backend.core.db import get_item_by_numeric_id


def search(topic: str, query: str, k: int, faiss_path: str):
    # Generate query embedding
    vec = embed_texts([query])[0]

    # Load FAISS index
    store = FaissStore(dim=len(vec), path=faiss_path)
    store.load()

    # Perform vector search
    results = store.search(vec, k)

    # Fetch matching metadata from MongoDB
    items = []
    for item_id, score in results:
        doc = get_item_by_numeric_id(item_id)
        if doc and doc.get("topic") == topic:
            items.append({
                "metadata": {
                    "title": doc.get("title"),
                    "desc": doc.get("desc"),
                    "url": doc.get("url"),
                    "source": doc.get("source"),
                    "popularity": doc.get("popularity"),
                    "topic": doc.get("topic"),
                },
                "score": float(score),
            })

    return items
