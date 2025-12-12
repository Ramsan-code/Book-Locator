// Admin service - handles admin-related API calls

import apiClient from "@/lib/apiClient";

export const adminService = {
  // Readers/Users
  async getPendingReaders(token: string): Promise<{ success: boolean; data: any[] }> {
    const response = await apiClient.get("/api/admin/users/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getAllReaders(
    token: string
  ): Promise<{ success: boolean; data: any[]; total: number; page: number; limit: number }> {
    const response = await apiClient.get("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async approveReader(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(
      `/api/admin/users/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async toggleUserStatus(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await apiClient.put(
      `/api/admin/users/${id}/toggle-status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async rejectReader(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Transactions
  async getPendingCommissions(
    token: string
  ): Promise<{ success: boolean; transactions: any[] }> {
    const response = await apiClient.get("/api/transactions/pending-commissions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async shareContactInfo(
    token: string,
    transactionId: string
  ): Promise<{ success: boolean; message: string; transaction: any }> {
    const response = await apiClient.post(
      `/api/transactions/${transactionId}/share-contact`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Settings
  async getSettings(token: string): Promise<{ success: boolean; data: any[] }> {
    const response = await apiClient.get("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateSettings(
    token: string,
    settings: any[]
  ): Promise<{ success: boolean; message: string; data: any[] }> {
    const response = await apiClient.put(
      "/api/admin/settings",
      { settings },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getPublicSettings(): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get("/api/admin/settings/public");
    return response.data;
  },

  // Books
  async getPendingBooks(
    token: string
  ): Promise<{ success: boolean; count: number; data: any[] }> {
    const response = await apiClient.get("/api/admin/books/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async approveBook(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await apiClient.put(
      `/api/admin/books/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async rejectBook(
    token: string,
    id: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await apiClient.put(
      `/api/admin/books/${id}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async deleteBook(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/admin/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getOwnerDetails(
    token: string,
    ownerId: string
  ): Promise<{
    success: boolean;
    data: { owner: any; books: any[]; reviews: any[]; stats: any };
  }> {
    const response = await apiClient.get(`/api/admin/books/owner/${ownerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async toggleFeaturedBook(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await apiClient.put(
      `/api/admin/books/${id}/toggle-featured`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
