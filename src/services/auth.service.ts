// Auth service - handles authentication API calls

import apiClient, { getErrorMessage } from "@/lib/apiClient";
import { AuthResponse, LoginCredentials, RegisterData, User } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post("/api/readers/login", credentials);
    const data = response.data;
    const reader = data.reader || data;

    return {
      success: true,
      message: data.message || "Login successful",
      token: data.token,
      user: {
        _id: reader._id,
        name: reader.name,
        email: reader.email,
        role: reader.role,
        isApproved: reader.isApproved,
        image: reader.image,
        phone_no: reader.phone_no,
        city: reader.city,
      },
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post("/api/readers/register", data);
    const resData = response.data;
    const reader = resData.reader || resData;

    return {
      success: true,
      message: resData.message || "Registration successful",
      token: resData.token,
      user: {
        _id: reader._id,
        name: reader.name,
        email: reader.email,
        role: reader.role,
        isApproved: reader.isApproved,
        image: reader.image,
      },
    };
  },

  async getMe(token: string): Promise<AuthResponse> {
    const response = await apiClient.get("/api/readers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;

    return {
      success: true,
      message: "Profile fetched successfully",
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        isApproved: data.isApproved,
        latitude: data.location?.coordinates?.[1],
        longitude: data.location?.coordinates?.[0],
        address: data.address,
        city: data.city,
        phone_no: data.phone_no,
        image: data.image,
      },
    };
  },

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(
      "/api/readers/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async createReader(data: any): Promise<AuthResponse> {
    const response = await apiClient.post("/api/readers", data);
    return response.data;
  },
};

export { getErrorMessage };
