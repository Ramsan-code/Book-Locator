"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, CheckCircle, Eye, XCircle, AlertTriangle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MyBooksPage() {
  const { user, token } = useAuth();
  const router = useRouter();
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
        
        const res = await bookService.getAll(params.toString());
        
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
        <Button asChild>
          <Link href="/auth/login">Login Now</Link>
        </Button>
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
      return <Badge className="bg-success hover:bg-success/90">Approved</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
        <Link href="/list-book">
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
            <CheckCircle className="h-8 w-8 text-success mb-2" />
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-warning mb-2" />
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-destructive mb-2" />
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Eye className="h-8 w-8 text-info mb-2" />
            <div className="text-2xl font-bold">{stats.views}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books yet</h3>
          <p className="text-muted-foreground mb-4">Start by listing your first book!</p>
          <Button asChild>
            <Link href="/list-book">
              <Plus className="h-4 w-4 mr-2" /> List New Book
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book._id} className={`overflow-hidden group ${book.approvalStatus === 'rejected' ? 'border-destructive/50' : ''}`}>
              <div className="aspect-[2/3] relative bg-muted">
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
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
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {book.owner?.city || "No District"}
                </div>
              </CardHeader>
              
              {/* Show rejection reason if book is rejected */}
              {book.approvalStatus === 'rejected' && book.rejectionReason && (
                <div className="px-4 pb-2">
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-destructive">Rejection Reason:</p>
                      <p className="text-xs text-destructive">{book.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                <Link href={`/books/${book._id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
