"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Loader2, X } from "lucide-react";
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
import { bookService } from "@/services";
import { getCurrentLocation, sortByDistance, formatDistance } from "@/lib/location";
import { toast } from "sonner";
import { BookFilters } from "@/components/books/BookFilters";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = [
  "Fiction",
  "Non-fiction",
  "Education",
  "Comics",
  "Sci-Fi",
  "Mystery",
  "Fantasy",
  "Romance",
  "Thriller",
  "Biography",
  "Self-Help",
  "History",
  "Other"
];

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth(); // Get logged-in user
  
  const [books, setBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  
  // Filter state
  const [filters, setFilters] = React.useState({
    categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
    conditions: searchParams.get("conditions")?.split(",").filter(Boolean) || [],
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
  });

  // Get user location on mount - prioritize stored location over browser geolocation
  React.useEffect(() => {
    const getLocation = async () => {
      setIsGettingLocation(true);
      try {
        // First, try to use logged-in user's stored location
        if (user?.latitude && user?.longitude) {
          setUserLocation({
            latitude: user.latitude,
            longitude: user.longitude,
          });
        } else {
          // Fallback to browser geolocation for guest users or users without stored location
          const location = await getCurrentLocation();
          setUserLocation(location);
        }
      } catch (error) {
        console.log("Location access denied or unavailable");
      } finally {
        setIsGettingLocation(false);
      }
    };
    getLocation();
  }, [user]);

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.categories.length) params.set("categories", filters.categories.join(","));
    if (filters.conditions.length) params.set("conditions", filters.conditions.join(","));
    if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
    
    const queryString = params.toString();
    router.replace(queryString ? `/books?${queryString}` : "/books", { scroll: false });
  }, [search, filters, router]);

  // Fetch books when filters change
  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (filters.categories.length) params.append("category", filters.categories.join(","));
        if (filters.conditions.length) params.append("condition", filters.conditions.join(","));
        if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
        
        // Fetch only approved and available books from the API
        params.append("available", "true");
        const res = await bookService.getAll(params.toString());
        
        if (res.success && res.books && res.books.length > 0) {
          let booksData = res.books;
          
          // Sort by distance if user location is available
          if (userLocation) {
            booksData = sortByDistance(booksData as any, userLocation.latitude, userLocation.longitude) as any;
          }
          
          setBooks(booksData);
        } else {
          // No books found
          setBooks([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading books:", error);
        toast.error("Failed to load books. Please try again.");
        setBooks([]);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [search, filters, userLocation]);

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      conditions: [],
      minPrice: undefined,
      maxPrice: undefined,
    });
    setSearch("");
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.conditions.length + 
    (filters.minPrice !== undefined ? 1 : 0) + 
    (filters.maxPrice !== undefined ? 1 : 0);

  const removeFilter = (type: string, value?: string) => {
    if (type === "category" && value) {
      setFilters({ ...filters, categories: filters.categories.filter(c => c !== value) });
    } else if (type === "condition" && value) {
      setFilters({ ...filters, conditions: filters.conditions.filter(c => c !== value) });
    } else if (type === "price") {
      setFilters({ ...filters, minPrice: undefined, maxPrice: undefined });
    }
  };

  const featuredBooks = books.slice(0, 4);
  const newArrivals = books.slice(4, 8);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Find Your Next Read, Sustainably
          </h1>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN"
              className="pl-10 h-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={filters.categories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newCategories = filters.categories.includes(category)
                    ? filters.categories.filter(c => c !== category)
                    : [...filters.categories, category];
                  setFilters({ ...filters, categories: newCategories });
                }}
                className={filters.categories.includes(category) ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="container px-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("category", cat)}
                />
              </Badge>
            ))}
            {filters.conditions.map((cond) => (
              <Badge key={cond} variant="secondary" className="gap-1">
                {cond}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("condition", cond)}
                />
              </Badge>
            ))}
            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <Badge variant="secondary" className="gap-1">
                Rs. {filters.minPrice || 0} - {filters.maxPrice || "∞"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("price")}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {isGettingLocation && (
        <div className="container px-4 mb-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Getting your location...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <BookFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Books Content */}
          <div className="flex-1">
            {/* Featured Listings */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                {search || activeFilterCount > 0 ? "Featured Results" : "Featured Listings"}
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : featuredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredBooks.map((book) => (
                    <Link key={book._id} href={`/books/${book._id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
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
                          <CardTitle className="line-clamp-1 text-base">{book.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0">
                          <span className="font-bold text-lg">Rs. {book.price}</span>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No featured books found{search || activeFilterCount > 0 ? " matching your criteria" : ""}.</p>
                </div>
              )}
            </div>

            {/* New Arrivals */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                {search || activeFilterCount > 0 ? "New Arrivals (Filtered)" : "New Arrivals"}
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : newArrivals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newArrivals.map((book) => (
                    <Link key={book._id} href={`/books/${book._id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
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
                          <CardTitle className="line-clamp-1 text-base">{book.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0">
                          <span className="font-bold text-lg">Rs. {book.price}</span>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No new arrivals found{search || activeFilterCount > 0 ? " matching your criteria" : ""}.</p>
                </div>
              )}
            </div>

            {/* All Books / Search Results */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {search ? `Search Results` : activeFilterCount > 0 ? "Filtered Books" : "All Books"}
                </h2>
                {books.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Showing {books.length} {books.length === 1 ? "book" : "books"}</span>
                  </div>
                )}
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">No Books Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {search || activeFilterCount > 0
                        ? "Try adjusting your search or filters"
                        : "There are no books available at the moment."}
                    </p>
                    {(search || activeFilterCount > 0) && (
                      <Button onClick={handleClearFilters} variant="outline">
                        Clear all filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {books.map((book) => (
                    <Link key={book._id} href={`/books/${book._id}`}>
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                        <CardContent className="p-0">
                          <div className="flex gap-4 p-4">
                            {/* Book Thumbnail */}
                            <div className="w-24 h-32 flex-shrink-0 relative overflow-hidden bg-muted rounded">
                              {book.image ? (
                                <img
                                  src={book.image}
                                  alt={book.title}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Book Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                {book.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {book.author}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                {book.condition && (
                                  <Badge variant="secondary">
                                    {book.condition}
                                  </Badge>
                                )}
                                {book.distance !== undefined && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {formatDistance(book.distance)}
                                  </span>
                                )}
                                <span className="font-bold text-lg text-emerald-600">
                                  Rs. {book.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <BooksContent />
    </React.Suspense>
  );
}
