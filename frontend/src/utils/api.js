// frontend/src/utils/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, method = "GET", data = null, authenticate = true) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (authenticate && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(responseData.error || "Something went wrong");
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

export const api = {
  get: (endpoint, authenticate = true) => apiRequest(endpoint, "GET", null, authenticate),
  post: (endpoint, data, authenticate = true) => apiRequest(endpoint, "POST", data, authenticate),
  put: (endpoint, data, authenticate = true) => apiRequest(endpoint, "PUT", data, authenticate),
  delete: (endpoint, authenticate = true) => apiRequest(endpoint, "DELETE", null, authenticate),
};
