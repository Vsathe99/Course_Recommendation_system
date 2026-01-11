from backend.recommender.cf import CFModel
from backend.core.faiss_store import FaissStore
from backend.core import db

def main():
    topics = db._get_db()["items"].distinct("topic")

    for topic in topics:
        try:
            faiss = FaissStore.from_topic(topic)
        except FileNotFoundError:
            print(f"[SKIP] No FAISS index for topic: {topic}")
            continue

        cf = CFModel(topic, faiss)

        if not cf.is_trained() or cf.is_stale(days=15):
            print(f"[TRAIN] Training CF for topic: {topic}")
            cf.fit()
        else:
            print(f"[SKIP] Model fresh for topic: {topic}")

if __name__ == "__main__":
    main()
