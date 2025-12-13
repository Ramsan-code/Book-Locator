import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: "", // Use relative path to leverage Next.js rewrites
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API Client Base URL:", apiClient.defaults.baseURL);

// Request interceptor: Add token from cookies
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on a login page (to avoid redirect loops during login failures)
      if (typeof window !== "undefined") {
        const isOnLoginPage = window.location.pathname.includes('/login');
        if (!isOnLoginPage) {
          // Clear auth cookies on unauthorized
          Cookies.remove("token");
          Cookies.remove("user");
          // Redirect to login
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Export error helper for consistent error handling
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper to extract error message from axios errors
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};
