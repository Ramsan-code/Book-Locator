// Review service - handles review-related API calls

import apiClient from "@/lib/apiClient";
import { ReviewsResponse, ReviewResponse, CreateReviewData, OwnerStatsResponse } from "@/types/review";
import { bookService } from "./book.service";

export const reviewService = {
  async getByBook(bookId: string): Promise<ReviewsResponse> {
    const response = await apiClient.get(`/api/reviews/${bookId}`);
    return response.data;
  },

  async create(
    token: string,
    bookId: string,
    data: CreateReviewData
  ): Promise<ReviewResponse> {
    const response = await apiClient.post(`/api/reviews/${bookId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async delete(token: string, reviewId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getOwnerStats(ownerId: string): Promise<OwnerStatsResponse> {
    try {
      // Fetch all books by this owner
      const booksResponse = await bookService.getAll(`owner=${ownerId}`);
      const ownerBooks = booksResponse.books || [];

      if (ownerBooks.length === 0) {
        return { success: true, averageRating: 0, reviewCount: 0 };
      }

      // Fetch reviews for all owner's books
      let totalRating = 0;
      let totalReviews = 0;

      for (const book of ownerBooks) {
        try {
          const reviewsResponse = await reviewService.getByBook(book._id);
          if (reviewsResponse.success && reviewsResponse.reviews) {
            const bookReviews = reviewsResponse.reviews;
            totalReviews += bookReviews.length;
            totalRating += bookReviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            );
          }
        } catch {
          // Skip if reviews fetch fails for a book
          continue;
        }
      }

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      return {
        success: true,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: totalReviews,
      };
    } catch {
      return { success: false, averageRating: 0, reviewCount: 0 };
    }
  },
};
