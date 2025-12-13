import { useState, useRef } from "react";
import { Heart, Bookmark, Star, Send, Search, Sparkles } from "lucide-react";
import AnimatedList from "@/components/AnimatedList/AnimatedList";



const TopicExplorer = () => {
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hideInputBar, setHideInputBar] = useState(false);
  const lastScrollTop = useRef(0);


  const handleSubmit = async () => {
    setIsLoading(true);

    const requestPayload = {
      topic: topic,
      subtopic: subtopic,
      extraInfo: extraInfo,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/explore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      const formattedResults = data.results.map((item) => ({
        ...item,
        liked: false,
        saved: false,
        userRating: null,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error("Error fetching results:", error);
      const mockResults = generateMockResults();
      setResults(mockResults);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResults = () => {
    const sources = [
      "Wikipedia",
      "Research Gate",
      "Academic Journal",
      "Expert Blog",
      "Industry Report",
    ];
    const baseDescriptions = [
      "A comprehensive overview exploring the fundamental concepts and practical applications within this domain.",
      "In-depth analysis revealing key insights and emerging trends that are shaping the future of this field.",
      "Expert perspectives combined with real-world case studies demonstrating effective implementation strategies.",
      "Critical examination of current methodologies with recommendations for best practices and optimization.",
      "Detailed exploration of interconnected concepts, providing a holistic understanding of the subject matter.",
    ];

    return Array.from({ length: 5 }, (_, i) => ({
      id: `result-${Date.now()}-${i}`,
      name: `${topic || "General Topic"}${
        subtopic ? `: ${subtopic}` : ""
      } - Insight ${i + 1}`,
      source: sources[i],
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      description: `${baseDescriptions[i]}${
        extraInfo
          ? ` Specifically addressing: "${extraInfo.slice(0, 100)}${
              extraInfo.length > 100 ? "..." : ""
            }"`
          : ""
      }`,
      liked: false,
      saved: false,
      userRating: null,
    }));
  };

  const toggleLiked = (id) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const toggleSaved = (id) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    );
  };

  const setUserRating = (id, rating) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, userRating: rating } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900 tracking-tight">
                SmartLearn AI
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-slate-900 flex items-center justify-center text-white font-medium text-sm shadow-md">
              JD
            </div>
          </div>
        </div>
      </nav>

      <main 
        className="flex-1 pb-64 overflow-auto"
         onScrollCapture={(e) => {
          const target = e.target;

          // only react to scroll-list scrolling
          if (!target.classList.contains("scroll-list")) return;

          const currentScroll = target.scrollTop;

          if (currentScroll > lastScrollTop.current + 10) {
            setHideInputBar(true);
          } else if (currentScroll < lastScrollTop.current - 10) {
            setHideInputBar(false);
          }

          lastScrollTop.current = currentScroll;
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* EMPTY STATE */}
          {results.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Discover Insights
              </h2>
              <p className="text-slate-600 max-w-md">
                Enter a topic and subtopic below to explore curated results and
                insights.
              </p>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600">Generating insights...</p>
            </div>
          )}

          {/* RESULTS */}
          {results.length > 0 && !isLoading && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                {results.length} Results Found
              </h3>

              <AnimatedList
                items={results}
                onToggleLiked={toggleLiked}
                onToggleSaved={toggleSaved}
                onSetRating={setUserRating}
                onItemSelect={(item) => {
                  // optional: handle card selection
                  console.log("Selected:", item);
                }}
                displayScrollbar={false}
              />
            </div>
          )}
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg transition-transform duration-300 ${
          hideInputBar ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Topic (e.g., Machine Learning)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Subtopic (e.g., Neural Networks)"
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
                <textarea
                  placeholder="Additional context or specific questions (optional)"
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="self-end px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Explore</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ item, onToggleLiked, onToggleSaved, onSetRating }) => {
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
            {item.description}
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
};

export default TopicExplorer;
