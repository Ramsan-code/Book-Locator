// Review entity types

import { User } from "./auth";

export interface Review {
  _id: string;
  book: string;
  reviewer: string | User;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review?: Review;
}

export interface OwnerStatsResponse {
  success: boolean;
  averageRating: number;
  reviewCount: number;
  breakdown?: { stars: number; percentage: number; count: number }[];
}
