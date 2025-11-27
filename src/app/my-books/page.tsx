"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, BookOpen, Clock, CheckCircle, Eye } from "lucide-react";
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
      if (!token) return;
      try {
        setIsLoading(true);
        // Assuming getAll supports filtering by 'my-books' or similar, or we filter client side if API returns all
        // For now, mocking the response as if it returns user's books
        const res = await booksApi.getAll("owner=me").catch(() => ({ success: false, books: [] }));
        
        if (res.success && res.books.length > 0) {
          setBooks(res.books);
        } else {
           // Fallback Mock Data
           setBooks([
             { _id: "1", title: "My Old Textbook", author: "Unknown", price: 500, category: "Education", status: "approved", views: 120, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop" },
             { _id: "2", title: "Pending Novel", author: "Me", price: 200, category: "Fiction", status: "pending", views: 0, image: null },
           ]);
        }
      } catch (error) {
        toast.error("Failed to load your books");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchMyBooks();
    else setIsLoading(false);
  }, [token]);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your books</h2>
        <LoginModal>
          <Button>Login Now</Button>
        </LoginModal>
      </div>
    );
  }

  const stats = {
    total: books.length,
    approved: books.filter(b => b.status === 'approved').length,
    pending: books.filter(b => b.status === 'pending').length,
    views: books.reduce((acc, b) => acc + (b.views || 0), 0),
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <Card key={book._id} className="overflow-hidden group">
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
                  <Badge variant={book.status === 'approved' ? 'default' : 'secondary'} className={book.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                    {book.status}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
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
