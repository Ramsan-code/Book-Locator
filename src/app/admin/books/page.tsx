"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, X, Loader2, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminBooksPage() {
  const { token } = useAuth();
  const [pendingBooks, setPendingBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPending = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await adminApi.getPendingBooks(token);
        setPendingBooks(response.data || []);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load pending books");
        setIsLoading(false);
      }
    };

    fetchPending();
  }, [token]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await adminApi.approveBook(token, id);
      setPendingBooks(prev => prev.filter(b => b._id !== id));
      toast.success("Book approved successfully");
    } catch (error) {
      toast.error("Failed to approve book");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await adminApi.rejectBook(token, id, "Does not meet quality standards");
      setPendingBooks(prev => prev.filter(b => b._id !== id));
      toast.success("Book rejected");
    } catch (error) {
      toast.error("Failed to reject book");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve new book listings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Books</CardTitle>
          <CardDescription>
            Books waiting for admin review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBooks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No pending books found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBooks.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {book.title}
                      </div>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell>Rs. {book.price}</TableCell>
                    <TableCell>{book.owner?.name || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Book</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to reject &quot;{book.title}&quot;?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="destructive" onClick={() => handleReject(book._id)} disabled={actionLoading === book._id}>
                                {actionLoading === book._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Book</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to approve &quot;{book.title}&quot;? It will be visible to all users.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button onClick={() => handleApprove(book._id)} disabled={actionLoading === book._id}>
                                {actionLoading === book._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Approve"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
