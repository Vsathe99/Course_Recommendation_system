import { useEffect, useState } from "react";
import { getLlmSuggestions } from "@/api/user";

const LlmSuggestionModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState([]);

  useEffect(() => {
  const raw = JSON.parse(
    localStorage.getItem("topicExplorerResults") || "[]"
  );

  const items = Array.isArray(raw) ? raw : Object.values(raw);

  getLlmSuggestions(items)
    .then(setExplanations)
    .finally(() => setLoading(false));
}, []);


  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          AI Learning Suggestions
        </h2>

        {loading ? (
          <p className="text-slate-500">Analyzing resources...</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {explanations.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-xl bg-slate-50"
              >
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {item.reason}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  className="text-green-600 text-sm mt-2 inline-block"
                >
                  Visit resource →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LlmSuggestionModal;
