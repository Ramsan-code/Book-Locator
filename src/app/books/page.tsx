"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { getCurrentLocation, sortByDistance, formatDistance } from "@/lib/location";
import { toast } from "sonner";

export default function BooksPage() {
  const [books, setBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  // Get user location on mount
  React.useEffect(() => {
    const getLocation = async () => {
      setIsGettingLocation(true);
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.log("Location access denied or unavailable");
      } finally {
        setIsGettingLocation(false);
      }
    };
    getLocation();
  }, []);

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const res = await booksApi.getAll(search ? `search=${search}` : "").catch(() => ({ success: false, books: [] }));
        
        let booksData = [];
        if (res.success && res.books && res.books.length > 0) {
          booksData = res.books;
        } else {
           // Fallback Mock Data with locations
           booksData = [
             { _id: "691fff37ab97832539568300", title: "MahaBaratham", author: "Kalki", price: 1500.99, category: "Fiction", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", latitude: 9.6615, longitude: 80.0255 },
             { _id: "691febd4c40fa5f20bd30fc9", title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99, category: "Fiction", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop", latitude: 9.6700, longitude: 80.0300 },
             { _id: "691d6b1c61e3fa1f9ea250db", title: "The Alchemist", author: "Paulo Coelho", price: 1200, category: "Fiction", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop", latitude: 9.6500, longitude: 80.0200 },
             { _id: "691c1e8a84da0fa4b2140ead", title: "The Great", author: "Ramshan", price: 12.99, category: "Fiction", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop", latitude: 9.6800, longitude: 80.0400 },
           ];
        }

        // Sort by distance if user location is available
        if (userLocation) {
          booksData = sortByDistance(booksData, userLocation.latitude, userLocation.longitude);
        }

        setBooks(booksData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading books:", error);
        // Still show mock data on error
        setBooks([
          { _id: "691fff37ab97832539568300", title: "MahaBaratham", author: "Kalki", price: 1500.99, category: "Fiction", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", latitude: 9.6615, longitude: 80.0255 },
          { _id: "691febd4c40fa5f20bd30fc9", title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99, category: "Fiction", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop", latitude: 9.6700, longitude: 80.0300 },
        ]);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [search, userLocation]);

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Books</h1>
          <p className="text-muted-foreground">
            {userLocation ? "Sorted by distance from you" : "Find your next favorite read"}
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      {isGettingLocation && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Getting your location...</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <Link key={book._id} href={`/books/${book._id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  {book.distance !== undefined && (
                    <Badge className="absolute top-2 right-2 bg-primary/90">
                      <MapPin className="h-3 w-3 mr-1" />
                      {formatDistance(book.distance)}
                    </Badge>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">
                    Rs. {book.price}
                  </span>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {book.category}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
