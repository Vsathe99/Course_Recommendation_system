export const howItWorksSteps = [
  {
    title: "User Input",
    subtitle: "Search & Topic Selection",
    description:
      "User searches for a topic or enters a learning query like 'Machine Learning with Python'.",
    icon: "🔍",
  },
  {
    title: "User Profiling",
    subtitle: "Cold Start Detection",
    description:
      "System checks whether the user is new or has prior interaction history.",
    icon: "👤",
  },
  {
    title: "Cold Start Recommendation (RAG)",
    subtitle: "New User or New Topic",
    description:
      "Retrieval-Augmented Generation fetches GitHub repos and YouTube videos using FAISS semantic search and Gemini embeddings.",
    icon: "🧠",
  },
  {
    title: "Personalized Recommendation (LightFM)",
    subtitle: "Returning User + Known Topic",
    description:
      "Hybrid collaborative + content-based filtering ranks resources using LightFM models trained on user interactions.",
    icon: "📊",
  },
  {
    title: "Ranked Results",
    subtitle: "Hybrid Scoring",
    description:
      "Zero-shot semantic relevance is blended with collaborative filtering scores to generate final ranked recommendations.",
    icon: "⭐",
  },
  {
    title: "User Feedback Loop",
    subtitle: "Like • Save • Click",
    description:
      "User interactions are logged and stored in MongoDB to continuously improve future recommendations.",
    icon: "🔁",
  },
];
