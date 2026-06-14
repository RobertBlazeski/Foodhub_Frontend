import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7252/api";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if we have one) to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize error messages so every page can show something useful.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The API returns either a string (BadRequest(ex.Message)) or an
      // object (validation errors), normalize to a string.
      const data = error.response.data;
      let message;

      if (typeof data === "string") {
        message = data;
      } else if (data?.title) {
        message = data.title;
      } else if (data?.errors) {
        message = Object.values(data.errors).flat().join(" ");
      } else {
        message = `Request failed with status ${error.response.status}`;
      }

      if (error.response.status === 401) {
        message = message || "Your session has expired. Please log in again.";
      }

      return Promise.reject(new Error(message));
    }

    return Promise.reject(
      new Error(
        "Could not reach the FoodHub API. Make sure the backend is running."
      )
    );
  }
);

export default client;
