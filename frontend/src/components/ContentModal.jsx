// components/ContentModal.jsx
import { useEffect, useState } from "react";
import AnimatedList from "@/components/AnimatedList/AnimatedList";
import { fetchLikedItems, fetchSavedItems } from "@/api/user";

const ContentModal = ({
  type,
  onClose,
  onToggleLiked,
  onToggleSaved,
  onSetRating,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher =
      type === "liked" ? fetchLikedItems : fetchSavedItems;

    fetcher()
      .then((data) =>
        setItems(
          data.map((item) => ({
            id: item._id,
            name: item.title,
            desc: item.desc,
            url: item.url,
            source: item.source,
            liked: item.liked,
            saved: item.saved,
            userRating: item.rating,
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4 capitalize">
          {type} items
        </h2>

        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : (
          <AnimatedList
            items={items}
            onToggleLiked={onToggleLiked}
            onToggleSaved={onToggleSaved}
            onSetRating={onSetRating}
            displayScrollbar
          />
        )}
      </div>
    </div>
  );
};

export default ContentModal;
