import axios from "axios";
import store from "../store/store";
import { setAccessToken, logout } from "../store/authSlice";

/* ================= CONFIG ================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= TOKEN QUEUE ================= */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    /* ---------- Network / Timeout ---------- */
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    /* ---------- Prevent infinite loop ---------- */
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        store.dispatch(setAccessToken(data.accessToken));

        api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
