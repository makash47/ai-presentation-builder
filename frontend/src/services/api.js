import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("apb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.data?.message) {
      return Promise.reject(error);
    }

    if (error?.code === "ERR_NETWORK" || !error?.response) {
      error.userMessage = `Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running.`;
    } else {
      error.userMessage = "Something went wrong while contacting the server.";
    }

    return Promise.reject(error);
  }
);

export default api;
