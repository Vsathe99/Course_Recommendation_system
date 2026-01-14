import { useState, useRef, useEffect } from "react";
import { Heart, Bookmark, Star, Send, Search, Sparkles } from "lucide-react";
import AnimatedList from "@/components/AnimatedList/AnimatedList";
import { getRecommendations, logInteraction } from "@/api/user";
import { useSelector } from "react-redux";



const UI_STATE_KEY = "topicExplorerItemState";

const getItemState = () => {
  try {
    return JSON.parse(localStorage.getItem(UI_STATE_KEY)) || {};
  } catch {
    return {};
  }
};

const setItemState = (itemId, patch) => {
  const state = getItemState();
  state[itemId] = { ...(state[itemId] || {}), ...patch };
  localStorage.setItem(UI_STATE_KEY, JSON.stringify(state));
};


const TopicExplorer = () => {
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hideInputBar, setHideInputBar] = useState(false);
  const lastScrollTop = useRef(0);
  const userId = useSelector((state) => state.user?.user?._id);
  console.log("userId:", userId);


  const handleSubmit = async () => {
  if (!topic || !userId) return;
  
  const searchKey = JSON.stringify({
  topic: topic.trim().toLowerCase(),
  subtopic: subtopic.trim().toLowerCase(),
  extraInfo: extraInfo.trim().toLowerCase(),
  });
   
  setResults([]);
  setIsLoading(true);

  

  try {
    const query = [subtopic, extraInfo].filter(Boolean).join(" ");

    const data = await getRecommendations({
      userId,
      topic,
      query,
    });

    const formatted = data.map((item) => ({
      id: item.id, // ideally Mongo _id
      name: item.title,
      desc: item.desc,
      url: item.url,
      source: item.source,
      score: item.score,
      used_cf: item.used_cf,
      liked: false,
      saved: false,
      userRating: null,
      _enterTs: Date.now(),
    }));

    setResults(formatted);
    localStorage.setItem("topicExplorerResults", JSON.stringify(formatted));
    localStorage.setItem("topicExplorerSearchKey", searchKey);
    localStorage.setItem(
      "topicExplorerQuery",
      JSON.stringify({ topic, subtopic, extraInfo })
    );

  } catch (err) {
    console.error("RAG error:", err);
  } finally {
    setIsLoading(false);
  }
};


  const toggleLiked = async (id) => {
  let nextLiked;

  setResults((prev) =>
    prev.map((item) => {
      if (item.id === id) {
        nextLiked = !item.liked;
        return { ...item, liked: nextLiked };
      }
      return item;
    })
  );

  setItemState(id, { liked: nextLiked });

  await logInteraction({
    userId,
    itemId: id,
    event: nextLiked ? "like" : "unlike",
  });
};


 const toggleSaved = async (id) => {
  let nextSaved;

  setResults((prev) =>
    prev.map((item) => {
      if (item.id === id) {
        nextSaved = !item.saved;
        return { ...item, saved: nextSaved };
      }
      return item;
    })
  );

  setItemState(id, { saved: nextSaved });

  await logInteraction({
    userId,
    itemId: id,
    event: nextSaved ? "save" : "unsave",
  });
};


  const setUserRating = async (id, rating) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, userRating: rating } : item
      )
    );

    setItemState(id, { userRating: rating });

    await logInteraction({
    userId,
    itemId: id,
    event: `rate:${rating}`,
  });
  };

  useEffect(() => {
    const savedResults = localStorage.getItem("topicExplorerResults");
    const savedQuery = localStorage.getItem("topicExplorerQuery");
    const savedKey = localStorage.getItem("topicExplorerSearchKey");

    if (!savedResults || !savedQuery || !savedKey) return;

    const { topic, subtopic, extraInfo } = JSON.parse(savedQuery);

    // restore inputs FIRST
    setTopic(topic);
    setSubtopic(subtopic);
    setExtraInfo(extraInfo);

    const currentKey = JSON.stringify({
      topic: topic.trim().toLowerCase(),
      subtopic: subtopic.trim().toLowerCase(),
      extraInfo: extraInfo.trim().toLowerCase(),
    });

    if (savedKey === currentKey) {
      const itemState = getItemState();

      const restoredResults = JSON.parse(savedResults).map((item) => ({
        ...item,
        liked: itemState[item.id]?.liked ?? item.liked ?? false,
        saved: itemState[item.id]?.saved ?? item.saved ?? false,
        userRating: itemState[item.id]?.userRating ?? item.userRating ?? null,
      }));

      setResults(restoredResults);

    }
    
    return () => {
    // runs when component unmounts (route change)
    localStorage.removeItem("topicExplorerResults");
    localStorage.removeItem("topicExplorerSearchKey");
    localStorage.removeItem("topicExplorerQuery");
    localStorage.removeItem("topicExplorerItemState");
  };
  }, []);


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




export default TopicExplorer;
