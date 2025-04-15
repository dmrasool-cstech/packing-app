import axios from "axios";

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Request interceptor to attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("usertoken");

    // If token exists, attach it to the request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token invalidation or absence
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Token expired or unauthorized
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (invalid or expired token)
      if (logoutHandler) logoutHandler(); // Automatically logout
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;
