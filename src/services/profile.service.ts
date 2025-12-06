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
};
