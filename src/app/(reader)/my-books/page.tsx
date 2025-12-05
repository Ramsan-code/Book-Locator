"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, BookOpen, Clock, CheckCircle, Eye, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { booksApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";

export default function MyBooksPage() {
  const { user, token } = useAuth();
  const [books, setBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMyBooks = async () => {
      if (!token || !user) return;
      try {
        setIsLoading(true);
        // Fetch books owned by current user, including pending ones
        // Pass owner ID and explicitly set isApproved to get all books (approved and pending)
        const params = new URLSearchParams({
          owner: user._id,
          isApproved: "all", // Fetch both approved and pending books
        });
        
        const res = await booksApi.getAll(params.toString());
        
        if (res.success && res.books) {
          setBooks(res.books);
        } else {
          setBooks([]);
        }
      } catch (error) {
        console.error("Failed to load books:", error);
        toast.error("Failed to load your books");
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && user) fetchMyBooks();
    else setIsLoading(false);
  }, [token, user]);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your books</h2>
        <LoginModal id="my-books-login-modal">
          <Button>Login Now</Button>
        </LoginModal>
      </div>
    );
  }

  const stats = {
    total: books.length,
    approved: books.filter(b => b.approvalStatus === 'approved' || b.isApproved).length,
    pending: books.filter(b => b.approvalStatus === 'pending').length,
    rejected: books.filter(b => b.approvalStatus === 'rejected').length,
    views: books.reduce((acc, b) => acc + (b.views || 0), 0),
  };

  const getStatusBadge = (book: any) => {
    if (book.approvalStatus === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (book.approvalStatus === 'approved' || book.isApproved) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
        <Link href="/books/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> List New Book
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Books</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Eye className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stats.views}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book._id} className={`overflow-hidden group ${book.approvalStatus === 'rejected' ? 'border-red-300' : ''}`}>
              <div className="aspect-[2/3] relative bg-gray-100">
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(book)}
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
              
              {/* Show rejection reason if book is rejected */}
              {book.approvalStatus === 'rejected' && book.rejectionReason && (
                <div className="px-4 pb-2">
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-700">Rejection Reason:</p>
                      <p className="text-xs text-red-600">{book.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

