// Transaction service - handles transaction API calls

import apiClient from "@/lib/apiClient";
import { TransactionsResponse, TransactionResponse } from "@/types/transaction";

export const transactionService = {
  async create(
    token: string,
    data: { bookId: string }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/api/transactions", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getMyRequests(token: string): Promise<TransactionsResponse> {
    const response = await apiClient.get("/api/transactions/my-transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getIncomingRequests(token: string): Promise<TransactionsResponse> {
    const response = await apiClient.get("/api/transactions/incoming-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateStatus(
    token: string,
    id: string,
    status: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(
      `/api/transactions/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async payCommission(
    token: string,
    id: string,
    paymentId: string,
    role: "buyer" | "seller"
  ): Promise<TransactionResponse & { bothPaid: boolean }> {
    const response = await apiClient.post(
      `/api/transactions/${id}/pay-commission`,
      { paymentId, role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
