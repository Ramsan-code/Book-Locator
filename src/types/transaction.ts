// Transaction entity types

import { Book } from "./book";
import { User } from "./auth";

export type TransactionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "commission_pending"
  | "commission_paid"
  | "completed"
  | "cancelled";

export interface Transaction {
  _id: string;
  book: string | Book;
  buyer: string | User;
  seller: string | User;
  status: TransactionStatus;
  buyerCommissionPaid?: boolean;
  sellerCommissionPaid?: boolean;
  buyerPaymentId?: string;
  sellerPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionData {
  bookId: string;
}

export interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
  bothPaid?: boolean;
}
