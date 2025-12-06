// Book entity types

import { User } from "./auth";

export interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  category?: string;
  condition?: string;
  price?: number;
  images?: string[];
  owner: string | User;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  city?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  description?: string;
  category?: string;
  condition?: string;
  price?: number;
  images?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  isAvailable?: boolean;
  isFeatured?: boolean;
}

export interface BookFilters {
  search?: string;
  categories?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  owner?: string;
}

export interface BooksResponse {
  success: boolean;
  books: Book[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface BookResponse {
  success: boolean;
  book: Book;
}
