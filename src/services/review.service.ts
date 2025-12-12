// Review service - handles review-related API calls

import apiClient from "@/lib/apiClient";
import { ReviewsResponse, ReviewResponse, CreateReviewData, OwnerStatsResponse } from "@/types/review";
import { bookService } from "./book.service";

export const reviewService = {
  async getAll(limit?: number): Promise<ReviewsResponse> {
    const response = await apiClient.get(`/api/reviews`);
    const reviews = response.data || [];
    // Apply limit if specified
    const limitedReviews = limit ? reviews.slice(0, limit) : reviews;
    return { success: true, reviews: limitedReviews };
  },

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
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      for (const book of ownerBooks) {
        try {
          const reviewsResponse = await reviewService.getByBook(book._id);
          if (reviewsResponse.success && reviewsResponse.reviews) {
            const bookReviews = reviewsResponse.reviews;
            totalReviews += bookReviews.length;
            
            bookReviews.forEach((review: any) => {
              totalRating += review.rating;
              const rating = Math.round(review.rating);
              if (rating >= 1 && rating <= 5) {
                starCounts[rating as keyof typeof starCounts]++;
              }
            });
          }
        } catch {
          // Skip if reviews fetch fails for a book
          continue;
        }
      }

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      // Calculate breakdown
      const breakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = starCounts[stars as keyof typeof starCounts];
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        return { stars, percentage, count };
      });

      return {
        success: true,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: totalReviews,
        breakdown
      };
    } catch {
      return { 
        success: false, 
        averageRating: 0, 
        reviewCount: 0,
        breakdown: [
          { stars: 5, percentage: 0, count: 0 },
          { stars: 4, percentage: 0, count: 0 },
          { stars: 3, percentage: 0, count: 0 },
          { stars: 2, percentage: 0, count: 0 },
          { stars: 1, percentage: 0, count: 0 },
        ]
      };
    }
  },
};
