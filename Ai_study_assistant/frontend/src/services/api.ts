import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export const setupAuthInterceptor = (getToken: () => Promise<string | null>, userId: string | null | undefined) => {
  api.interceptors.request.clear();
  api.interceptors.request.use(async (config) => {
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    const token = await getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
};