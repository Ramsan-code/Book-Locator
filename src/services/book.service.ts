// Book service - handles book-related API calls

import apiClient from "@/lib/apiClient";
import { Book, BooksResponse, BookResponse, CreateBookData, UpdateBookData } from "@/types/book";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

export const bookService = {
  async getAll(params?: string): Promise<BooksResponse> {
    const response = await apiClient.get(`/api/books${params ? `?${params}` : ""}`);
    const data = response.data;
    return {
      success: data.success,
      books: data.data || [],
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  },

  async getOne(id: string): Promise<BookResponse> {
    const response = await apiClient.get(`/api/books/${id}`);
    return { success: true, book: response.data };
  },

  async create(token: string, data: CreateBookData): Promise<any> {
    const response = await apiClient.post("/api/books", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async update(
    token: string,
    id: string,
    data: Partial<UpdateBookData>
  ): Promise<{ success: boolean; message: string; book: Book }> {
    const response = await apiClient.put(`/api/books/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async delete(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async uploadImage(token: string, file: File): Promise<any> {
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
