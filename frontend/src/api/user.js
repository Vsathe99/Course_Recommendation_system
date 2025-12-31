import api from "./axios";

export const fetchMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

/* ================= RAG / FASTAPI ================= */

export const getRecommendations = async ({
  userId,
  topic,
  query,
  k = 10,
  alpha = 0.5,
}) => {
  const { data } = await api.get(
    `${import.meta.env.VITE_RAG_API_URL}/recommendations`,
    {
      params: {
        user_id: userId,
        topic,
        q: query,
        k,
        alpha,
      },
    }
  );

  return data;
};

export const logInteraction = async ({
  userId,
  itemId,
  event,
  dwellTime,
}) => {
  return api.post(
    `${import.meta.env.VITE_RAG_API_URL}/interactions`,
    {
      user_id: userId,
      item_id: itemId,
      event,
      dwell_time_ms: dwellTime,
    }
  );
};