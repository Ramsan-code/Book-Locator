"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Trash2, BookOpen } from "lucide-react";
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
import { toast } from "sonner";

export default function MyFavoritesPage() {
  const [books, setBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);

  // Load favorites from localStorage and fetch book details
  React.useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        
        // Get favorite IDs from localStorage
        const storedFavorites = JSON.parse(
          localStorage.getItem("book-locator-favorites") || "[]"
        );
        setFavoriteIds(storedFavorites);

        if (storedFavorites.length === 0) {
          setBooks([]);
          return;
        }

        // Fetch details for each favorite book
        const bookPromises = storedFavorites.map(async (bookId: string) => {
          try {
            const res = await bookService.getOne(bookId);
            if (res.success && res.book) {
              return res.book;
            }
            return null;
          } catch {
            return null;
          }
        });

        const fetchedBooks = await Promise.all(bookPromises);
        const validBooks = fetchedBooks.filter((book) => book !== null);
        setBooks(validBooks);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        toast.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFromFavorites = (bookId: string) => {
    // Remove from localStorage
    const newFavorites = favoriteIds.filter((id) => id !== bookId);
    localStorage.setItem("book-locator-favorites", JSON.stringify(newFavorites));
    setFavoriteIds(newFavorites);
    
    // Remove from displayed books
    setBooks(books.filter((book) => book._id !== bookId));
    toast.success("Removed from favorites");
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        </div>
        <Link href="/books">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" /> Browse Books
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Heart className="h-10 w-10 text-red-500 fill-red-500" />
            <div>
              <div className="text-3xl font-bold">{books.length}</div>
              <div className="text-muted-foreground">Favorite Books</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-4">
            Start adding books to your favorites by clicking the heart icon on any book.
          </p>
          <Link href="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book._id} className="overflow-hidden group">
              <Link href={`/books/${book._id}`}>
                <div className="aspect-[2/3] relative bg-muted">
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={book.available ? "default" : "secondary"}>
                      {book.available ? "Available" : "Sold"}
                    </Badge>
                  </div>
                </div>
              </Link>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    Rs. {book.price}
                  </span>
                  <Badge variant="outline">{book.condition}</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => handleRemoveFromFavorites(book._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove from Favorites
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
