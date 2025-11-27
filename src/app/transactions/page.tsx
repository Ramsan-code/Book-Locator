"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { transactionsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";
import { Loader2, Check, X } from "lucide-react";

export default function TransactionsPage() {
  const { user, token } = useAuth();
  const [myRequests, setMyRequests] = React.useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [myRes, incomingRes] = await Promise.all([
        transactionsApi.getMyRequests(token).catch(() => ({ success: false, transactions: [] })),
        transactionsApi.getIncomingRequests(token).catch(() => ({ success: false, transactions: [] })),
      ]);

      if (myRes.success) setMyRequests(myRes.transactions);
      else {
        // Mock Data
        setMyRequests([
          { _id: "1", book: { title: "The Alchemist", author: "Paulo Coelho" }, status: "pending", createdAt: "2023-11-20" },
          { _id: "2", book: { title: "MahaBaratham", author: "Kalki" }, status: "accepted", createdAt: "2023-11-15" },
        ]);
      }

      if (incomingRes.success) setIncomingRequests(incomingRes.transactions);
      else {
        // Mock Data
        setIncomingRequests([
          { _id: "3", book: { title: "My Old Textbook" }, requester: { name: "John Doe" }, status: "pending", createdAt: "2023-11-25" },
        ]);
      }
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await transactionsApi.updateStatus(token, id, status);
      toast.success(`Request ${status}`);
      // Optimistic update or refetch
      setIncomingRequests(prev => prev.map(req => req._id === id ? { ...req, status } : req));
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view transactions</h2>
        <LoginModal>
          <Button>Login Now</Button>
        </LoginModal>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-emerald-500">Accepted</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Transactions</h1>

      <Tabs defaultValue="my-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="incoming-requests">Incoming Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>Books I Requested</CardTitle>
              <CardDescription>Track the status of your book requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No requests found.</div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((req) => (
                    <div key={req._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{req.book?.title || "Unknown Book"}</h4>
                        <p className="text-sm text-muted-foreground">{req.book?.author}</p>
                        <p className="text-xs text-muted-foreground mt-1">Requested on {req.createdAt}</p>
                      </div>
                      <div>{getStatusBadge(req.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming-requests">
          <Card>
            <CardHeader>
              <CardTitle>Requests for My Books</CardTitle>
              <CardDescription>Manage requests from other users.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : incomingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No incoming requests.</div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((req) => (
                    <div key={req._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-4">
                      <div>
                        <h4 className="font-semibold">{req.book?.title || "Unknown Book"}</h4>
                        <p className="text-sm text-muted-foreground">Requested by <span className="font-medium text-foreground">{req.requester?.name || "Unknown User"}</span></p>
                        <p className="text-xs text-muted-foreground mt-1">{req.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {req.status === 'pending' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusUpdate(req._id, 'rejected')}
                              disabled={actionLoading === req._id}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleStatusUpdate(req._id, 'accepted')}
                              disabled={actionLoading === req._id}
                            >
                              {actionLoading === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Accept</>}
                            </Button>
                          </>
                        ) : (
                          getStatusBadge(req.status)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
