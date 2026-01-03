import { useState } from "react";
import { Heart, Bookmark, Star, Send, Search, Sparkles } from "lucide-react";

export default function ResultCard({
  item,
  onToggleLiked,
  onToggleSaved,
  onSetRating,
}) {
  const [ratingOpen, setRatingOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h4 className="text-lg font-semibold text-slate-900 leading-tight">
              {item.name}
            </h4>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
              {item.source}
            </span>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-3">
            {item.desc}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed mb-3">
            {item.url}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed mb-3">
            User recommended: {item.used_cf ? "Yes" : "No"}
          </p>

          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-slate-900">
              {item.rating}
            </span>
            <span className="text-xs text-slate-500">/ 5</span>
          </div>
        </div>

        <div className="flex lg:flex-col items-center lg:items-end gap-2 lg:gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-4">
          <button
            onClick={() => onToggleSaved(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
              item.saved
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-700"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${item.saved ? "fill-green-700" : ""}`}
            />
            <span>{item.saved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={() => onToggleLiked(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
              item.liked
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700"
            }`}
          >
            <Heart className={`w-4 h-4 ${item.liked ? "fill-rose-700" : ""}`} />
            <span>{item.liked ? "Liked" : "Like"}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setRatingOpen(!ratingOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                item.userRating
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              <Star
                className={`w-4 h-4 ${item.userRating ? "fill-amber-700" : ""}`}
              />
              <span>{item.userRating ? `${item.userRating}/5` : "Rate"}</span>
            </button>

            {ratingOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        onSetRating(item.id, rating);
                        setRatingOpen(false);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        item.userRating === rating
                          ? "bg-amber-500 text-white"
                          : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
