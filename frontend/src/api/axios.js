import axios from "axios";
import store from "../store/store";
import { setAccessToken, logout } from "../store/authSlice";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        store.dispatch(setAccessToken(data.accessToken));
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
