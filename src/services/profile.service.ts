// Profile service - handles user profile API calls

import apiClient from "@/lib/apiClient";

export const profileService = {
  async getProfile(token: string): Promise<{ success: boolean; profile: any }> {
    const response = await apiClient.get("/api/readers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, profile: response.data };
  },

  async updateProfile(
    token: string,
    data: any
  ): Promise<{ success: boolean; message: string; user: any }> {
    const response = await apiClient.put("/api/readers/profile", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(
      "/api/readers/change-password",
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async deleteAccount(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete("/api/readers/account", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
