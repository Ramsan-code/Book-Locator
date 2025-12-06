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
import { transactionService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";
import { Loader2, Check, X, User, Mail, Phone, MapPin, Info, CreditCard, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommissionPayment } from "@/components/payments/CommissionPayment";

export default function TransactionsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [myRequests, setMyRequests] = React.useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [myRes, incomingRes] = await Promise.all([
        transactionService.getMyRequests(token).catch(() => ({ success: false, transactions: [] })),
        transactionService.getIncomingRequests(token).catch(() => ({ success: false, transactions: [] })),
      ]);

      if (myRes.success) setMyRequests(myRes.transactions);
      else {
        // Mock Data
        setMyRequests([
          { _id: "1", book: { title: "The Alchemist", author: "Paulo Coelho" }, status: "pending", createdAt: "2023-11-20" },
          { _id: "2", book: { title: "MahaBaratham", author: "Kalki" }, status: "accepted", createdAt: "2023-11-15" },
          { _id: "4", book: { title: "Clean Code", author: "Robert C. Martin" }, status: "rejected", createdAt: "2023-11-10" },
          { _id: "5", book: { title: "Design Patterns", author: "Erich Gamma" }, status: "pending", createdAt: "2023-11-28" },
        ]);
      }

      if (incomingRes.success) setIncomingRequests(incomingRes.transactions);
      else {
        // Mock Data
        setIncomingRequests([
          { 
            _id: "3", 
            book: { title: "My Old Textbook", owner: { name: user?.name, email: user?.email, phone_no: "+1 (555) 123-4567", city: "Oakland, CA" } }, 
            requester: { _id: "owner1", name: "John Doe", email: "john@example.com", phone_no: "+1 (555) 987-6543", city: "San Francisco, CA" }, 
            status: "pending", 
            createdAt: "2023-11-25T10:30:00Z" 
          },
          { 
            _id: "6", 
            book: { title: "Introduction to Algorithms", owner: { name: user?.name, email: user?.email, phone_no: "+1 (555) 123-4567", city: "Oakland, CA" } }, 
            requester: { _id: "owner2", name: "Jane Smith", email: "jane@example.com", phone_no: "+1 (555) 555-1234", city: "Berkeley, CA" }, 
            status: "accepted", 
            createdAt: "2023-11-22T14:15:00Z" 
          },
          { 
            _id: "7", 
            book: { title: "The Pragmatic Programmer", owner: { name: user?.name, email: user?.email, phone_no: "+1 (555) 123-4567", city: "Oakland, CA" } }, 
            requester: { _id: "owner3", name: "Alice Johnson", email: "alice@example.com", phone_no: "+1 (555) 777-8888", city: "Oakland, CA" }, 
            status: "rejected", 
            createdAt: "2023-11-18T09:45:00Z" 
          },
          { 
            _id: "8", 
            book: { title: "Refactoring", owner: { name: user?.name, email: user?.email, phone_no: "+1 (555) 123-4567", city: "Oakland, CA" } }, 
            requester: { _id: "owner4", name: "Bob Wilson", email: "bob@example.com", phone_no: "+1 (555) 999-0000", city: "San Jose, CA" }, 
            status: "pending", 
            createdAt: "2023-11-29T16:20:00Z" 
          },
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
      await transactionService.updateStatus(token, id, status);
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
        <LoginModal id="transactions-login-modal">
          <Button>Login Now</Button>
        </LoginModal>
      </div>
    );
  }

  const getStatusBadge = (status: string, transaction?: any, role?: 'buyer' | 'seller') => {
    switch (status) {
      case 'accepted': 
        return <Badge className="bg-emerald-500">Accepted</Badge>;
      case 'commission_pending':
        if (role === 'buyer') {
          return transaction?.buyerCommissionPaid 
            ? <Badge className="bg-blue-500">Paid (Waiting for Seller)</Badge>
            : <Badge variant="outline" className="border-emerald-500 text-emerald-600">Payment Required</Badge>;
        } else if (role === 'seller') {
          return transaction?.sellerCommissionPaid
            ? <Badge className="bg-blue-500">Paid (Waiting for Buyer)</Badge>
            : <Badge variant="outline" className="border-emerald-500 text-emerald-600">Payment Required</Badge>;
        }
        return <Badge className="bg-yellow-500">Commission Pending</Badge>;
      case 'commission_paid':
        return <Badge className="bg-purple-500">Processing Contact Info...</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Contact Shared</Badge>;
      case 'rejected': 
        return <Badge variant="destructive">Rejected</Badge>;
      default: 
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                    <div key={req._id} className="flex flex-col sm:flex-row justify-between items-start p-4 border rounded-lg gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{req.book?.title || "Unknown Book"}</h4>
                        <p className="text-sm text-muted-foreground">{req.book?.author}</p>
                        <p className="text-xs text-muted-foreground mt-1">Requested on {formatDate(req.createdAt)}</p>
                        
                        {/* Commission Payment Status */}
                        {req.status === 'commission_pending' && (
                          <div className="mt-3">
                            {!req.buyerCommissionPaid ? (
                              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                <Info className="h-4 w-4" />
                                <span>Please pay commission to receive seller contact.</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                <Clock className="h-4 w-4" />
                                <span>You paid! Waiting for seller to pay commission.</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Contact Info Display (When Completed) */}
                        {req.status === 'completed' && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3">
                            <h5 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" /> Seller Contact
                            </h5>
                            <div className="grid gap-1 text-sm text-green-700">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" /> {req.seller?.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" /> {req.seller?.email}
                              </div>
                              {req.seller?.phone_no && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" /> {req.seller?.phone_no}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(req.status, req, 'buyer')}
                        
                        {req.status === 'commission_pending' && !req.buyerCommissionPaid && (
                          <CommissionPayment 
                            transaction={req} 
                            role="buyer" 
                            onPaymentComplete={fetchData} 
                          />
                        )}
                      </div>
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
                    <div key={req._id} className="flex flex-col sm:flex-row justify-between items-start p-4 border rounded-lg gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{req.book?.title || "Unknown Book"}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Requested by <span className="font-medium text-foreground">{req.requester?.name || "Unknown User"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(req.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {req.requester?._id && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/profile/${req.requester._id}`)}
                            >
                              <User className="h-4 w-4 mr-1" /> View Profile
                            </Button>
                          )}
                          
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
                                onClick={() => handleStatusUpdate(req._id, 'accepted')}
                                disabled={actionLoading === req._id}
                              >
                                {actionLoading === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Accept</>}
                              </Button>
                            </>
                          ) : (
                            getStatusBadge(req.status, req, 'seller')
                          )}
                        </div>

                        {/* Commission Payment Button for Seller */}
                        {req.status === 'commission_pending' && !req.sellerCommissionPaid && (
                          <CommissionPayment 
                            transaction={req} 
                            role="seller" 
                            onPaymentComplete={fetchData} 
                          />
                        )}
                        
                        {/* Seller Status Message */}
                        {req.status === 'commission_pending' && req.sellerCommissionPaid && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 mt-1">
                            Waiting for buyer to pay commission.
                          </div>
                        )}
                        
                        {/* Contact Info for Seller */}
                        {req.status === 'completed' && (
                          <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3 w-full max-w-xs">
                            <h5 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" /> Buyer Contact
                            </h5>
                            <div className="grid gap-1 text-sm text-green-700">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" /> {req.buyer?.name || req.requester?.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" /> {req.buyer?.email || req.requester?.email}
                              </div>
                              {(req.buyer?.phone_no || req.requester?.phone_no) && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" /> {req.buyer?.phone_no || req.requester?.phone_no}
                                </div>
                              )}
                            </div>
                          </div>
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
