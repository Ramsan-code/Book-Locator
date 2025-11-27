// src/lib/api.ts

import { AuthResponse, LoginCredentials, RegisterData } from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://book-link-api.vercel.app";

// ----------------------
// Custom Error Class
// ----------------------
class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ----------------------
// Universal Request Helper
// ----------------------
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      mode: "cors",
      credentials: "omit",
    });

    let data: any;

    try {
      data = await res.json();
    } catch {
      throw new ApiError("Invalid JSON response", res.status);
    }

    if (!res.ok) {
      throw new ApiError(
        data.message || data.error || "Request failed",
        res.status,
        data
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "Failed to connect to server. Please check your internet connection.",
      0
    );
  }
}

// ----------------------
// AUTH API
// ----------------------
export const authApi = {
  login(credentials: LoginCredentials) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register(data: RegisterData) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe(token: string) {
    return request<AuthResponse>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  logout(token: string) {
    return request<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createReader(data: any) {
    return request<AuthResponse>("/api/readers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ----------------------
// ADMIN API
// ----------------------
export const adminApi = {
  // Sellers
  getPendingSellers(token: string) {
    return request<{ success: boolean; sellers: any[] }>(
      "/api/admin/sellers/pending",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  approveSeller(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/api/admin/sellers/${id}/approve`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  rejectSeller(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/api/admin/sellers/${id}/reject`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Deliverers
  getPendingDeliverers(token: string) {
    return request<{ success: boolean; deliverers: any[] }>(
      "/api/admin/deliverers/pending",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  approveDeliverer(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/api/admin/deliverers/${id}/approve`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  rejectDeliverer(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/api/admin/deliverers/${id}/reject`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

// ----------------------
// BOOKS API
// ----------------------
export const booksApi = {
  getAll(params?: string) {
    return request<{ success: boolean; books: any[] }>(`/api/books${params ? `?${params}` : ""}`);
  },

  getOne(id: string) {
    return request<{ success: boolean; book: any }>(`/api/books/${id}`);
  },

  create(token: string, data: any) {
    return request<{ success: boolean; message: string; book: any }>("/api/books", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  update(token: string, id: string, data: any) {
    return request<{ success: boolean; message: string; book: any }>(`/api/books/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  delete(token: string, id: string) {
    return request<{ success: boolean; message: string }>(`/api/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ----------------------
// TRANSACTIONS API
// ----------------------
export const transactionsApi = {
  create(token: string, data: { bookId: string }) {
    return request<{ success: boolean; message: string }>("/api/transactions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  getMyRequests(token: string) {
    return request<{ success: boolean; transactions: any[] }>("/api/transactions/my-transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getIncomingRequests(token: string) {
    return request<{ success: boolean; transactions: any[] }>("/api/transactions/incoming-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateStatus(token: string, id: string, status: string) {
    return request<{ success: boolean; message: string }>(`/api/transactions/${id}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },
};

// ----------------------
// PROFILE API
// ----------------------
export const profileApi = {
  getProfile(token: string) {
    return request<{ success: boolean; profile: any }>("/api/readers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateProfile(token: string, data: any) {
    return request<{ success: boolean; message: string; user: any }>("/api/readers/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
};

export { ApiError };
