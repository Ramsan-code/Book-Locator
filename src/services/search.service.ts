// Search service - handles search-related API calls

import apiClient from "@/lib/apiClient";
import { BooksResponse, BookFilters } from "@/types/book";

export const searchService = {
  async advanced(params: BookFilters): Promise<BooksResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("q", params.search);
    if (params.categories?.length)
      queryParams.append("categories", params.categories.join(","));
    if (params.conditions?.length)
      queryParams.append("conditions", params.conditions.join(","));
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/api/books/search/advanced?${queryParams.toString()}`
    );
    const data = response.data;
    return {
      success: data.success,
      books: data.data || data.books || [],
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  },

  async nearby(
    lat: number,
    lng: number,
    maxDistance?: number
  ): Promise<BooksResponse & { total?: number }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (maxDistance) params.append("maxDistance", maxDistance.toString());

    const response = await apiClient.get(
      `/api/books/search/nearby?${params.toString()}`
    );
    const data = response.data;
    return {
      success: data.success,
      books: data.data || data.books || [],
      total: data.total,
    };
  },

  async featured(page?: number, limit?: number): Promise<BooksResponse> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const response = await apiClient.get(
      `/api/books/featured${params.toString() ? `?${params.toString()}` : ""}`
    );
    const data = response.data;
    return {
      success: data.success,
      books: data.data || data.books || [],
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  },
};
