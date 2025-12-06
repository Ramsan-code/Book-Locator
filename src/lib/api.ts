// src/lib/api.ts

import { AuthResponse, LoginCredentials, RegisterData } from "@/types/auth";

const API_BASE_URL = "https://book-link-api-git-main-ramsan.vercel.app";

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
  async login(credentials: LoginCredentials) {
    const response: any = await request("/api/readers/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    // Backend returns user data in 'reader' field
    const reader = response.reader || response;
    
    // Transform backend response to match AuthResponse interface
    return {
      success: true,
      message: response.message || "Login successful",
      token: response.token,
      user: {
        _id: reader._id,
        name: reader.name,
        email: reader.email,
        role: reader.role,
        isApproved: reader.isApproved,
        image: reader.image,
      }
    } as AuthResponse;
  },

  async register(data: RegisterData) {
    const response: any = await request("/api/readers/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    // Backend returns user data in 'reader' field
    const reader = response.reader || response;
    
    // Transform backend response to match AuthResponse interface
    return {
      success: true,
      message: response.message || "Registration successful",
      token: response.token,
      user: {
        _id: reader._id,
        name: reader.name,
        email: reader.email,
        role: reader.role,
        isApproved: reader.isApproved,
        image: reader.image,
      }
    } as AuthResponse;
  },

  async getMe(token: string) {
    const response: any = await request("/api/readers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Transform backend response to match AuthResponse interface
    return {
      success: true,
      message: "Profile fetched successfully",
      user: {
        _id: response._id,
        name: response.name,
        email: response.email,
        role: response.role,
        isApproved: response.isApproved,
        latitude: response.location?.coordinates?.[1],
        longitude: response.location?.coordinates?.[0],
        address: response.address,
        city: response.city,
        phone_no: response.phone_no,
        image: response.image,
      }
    } as AuthResponse;
  },

  logout(token: string) {
    return request<{ success: boolean; message: string }>("/api/readers/logout", {
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
// ----------------------
// ADMIN API
// ----------------------
export const adminApi = {
  // Readers
    getPendingReaders(token: string) {
    return request<{ success: boolean; data: any[] }>(
      "/api/admin/users/pending",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getAllReaders(token: string) {
    return request<{ success: boolean; data: any[]; total: number; page: number; limit: number }>(
      "/api/admin/users",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  approveReader(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/api/admin/users/${id}/approve`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  toggleUserStatus(token: string, id: string) {
    return request<{ success: boolean; message: string; data: any }>(
      `/api/admin/users/${id}/toggle-status`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  rejectReader(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/api/admin/users/${id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Transactions
  getPendingCommissions(token: string) {
    return request<{ success: boolean; transactions: any[] }>(
      "/api/transactions/pending-commissions",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  shareContactInfo(token: string, transactionId: string) {
    return request<{ success: boolean; message: string; transaction: any }>(
      `/api/transactions/${transactionId}/share-contact`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Settings
  getSettings(token: string) {
    return request<{ success: boolean; data: any[] }>(
      "/api/admin/settings",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  updateSettings(token: string, settings: any[]) {
    return request<{ success: boolean; message: string; data: any[] }>(
      "/api/admin/settings",
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings }),
      }
    );
  },

  // Get public settings (no auth required)
  getPublicSettings() {
    return request<{ success: boolean; data: any }>("/api/admin/settings/public");
  },

  // Books
  getPendingBooks(token: string) {
    return request<{ success: boolean; count: number; data: any[] }>(
      "/api/admin/books/pending",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  approveBook(token: string, id: string) {
    return request<{ success: boolean; message: string; data: any }>(
      `/api/admin/books/${id}/approve`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
  },

  rejectBook(token: string, id: string, reason?: string) {
    return request<{ success: boolean; message: string; data: any }>(
      `/api/admin/books/${id}/reject`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      }
    );
  },

  getOwnerDetails(token: string, ownerId: string) {
    return request<{ success: boolean; data: { owner: any; books: any[]; reviews: any[]; stats: any } }>(
      `/api/admin/books/owner/${ownerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

// ----------------------
// BOOKS API
// ----------------------
export const booksApi = {
  async getAll(params?: string) {
    const response: any = await request(`/api/books${params ? `?${params}` : ""}`);
    // Backend returns books in 'data' field, transform to 'books' for frontend
    return {
      success: response.success,
      books: response.data || [],
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  },

  async getOne(id: string) {
    const book = await request<any>(`/api/books/${id}`);
    return { success: true, book };
  },

  create(token: string, data: any) {
    return request<any>("/api/books", {
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

  async uploadImage(token: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return response.json();
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

  payCommission(token: string, id: string, paymentId: string, role: 'buyer' | 'seller') {
    return request<{ success: boolean; message: string; transaction: any; bothPaid: boolean }>(
      `/api/transactions/${id}/pay-commission`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentId, role }),
      }
    );
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

// ----------------------
// SEARCH API
// ----------------------
export const searchApi = {
  async advanced(params: {
    search?: string;
    categories?: string[];
    conditions?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('q', params.search);
    if (params.categories?.length) queryParams.append('categories', params.categories.join(','));
    if (params.conditions?.length) queryParams.append('conditions', params.conditions.join(','));
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response: any = await request(`/api/books/search/advanced?${queryParams.toString()}`);
    return {
      success: response.success,
      books: response.data || response.books || [],
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  },

  async nearby(lat: number, lng: number, maxDistance?: number) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (maxDistance) params.append('maxDistance', maxDistance.toString());
    
    const response: any = await request(`/api/books/search/nearby?${params.toString()}`);
    return {
      success: response.success,
      books: response.data || response.books || [],
      total: response.total,
    };
  },

  async featured(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response: any = await request(`/api/books/featured${params.toString() ? `?${params.toString()}` : ''}`);
    return {
      success: response.success,
      books: response.data || response.books || [],
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  },
};

// ----------------------
// REVIEWS API
// ----------------------
export const reviewsApi = {
  getByBook(bookId: string) {
    return request<{ success: boolean; reviews: any[] }>(`/api/reviews/${bookId}`);
  },

  create(token: string, bookId: string, data: { rating: number; comment: string }) {
    return request<{ success: boolean; message: string; review: any }>(`/api/reviews/${bookId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  delete(token: string, reviewId: string) {
    return request<{ success: boolean; message: string }>(`/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get owner statistics (average rating from all their books' reviews)
  async getOwnerStats(ownerId: string) {
    try {
      // Fetch all books by this owner
      const booksResponse: any = await request(`/api/books?owner=${ownerId}`);
      const ownerBooks = booksResponse.data || [];
      
      if (ownerBooks.length === 0) {
        return { success: true, averageRating: 0, reviewCount: 0 };
      }
      
      // Fetch reviews for all owner's books
      let totalRating = 0;
      let totalReviews = 0;
      
      for (const book of ownerBooks) {
        try {
          const reviewsResponse = await reviewsApi.getByBook(book._id);
          if (reviewsResponse.success && reviewsResponse.reviews) {
            const bookReviews = reviewsResponse.reviews;
            totalReviews += bookReviews.length;
            totalRating += bookReviews.reduce((sum: number, review: any) => sum + review.rating, 0);
          }
        } catch (error) {
          // Skip if reviews fetch fails for a book
          continue;
        }
      }
      
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      return {
        success: true,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: totalReviews,
      };
    } catch (error) {
      return { success: false, averageRating: 0, reviewCount: 0 };
    }
  },
};

export { ApiError };
