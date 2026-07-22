import axios from "axios";

// Create an Axios instance pointing to FastAPI backend
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Optional: redirect to login or trigger an auth event
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);
