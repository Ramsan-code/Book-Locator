"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  MapPin,
  Search,
  Rocket,
  User,
  Hourglass,
  FileText,
  Camera,
  Banknote,
  Star,
  Leaf,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookService, adminService, reviewService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentLocation, sortByDistance, formatDistance } from "@/lib/location";
import { RatingDisplay } from "@/components/reviews/RatingDisplay";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [featuredBooks, setFeaturedBooks] = React.useState<any[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<any[]>([]);
  const [allBooks, setAllBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [ownerStats, setOwnerStats] = React.useState<{ averageRating: number; reviewCount: number } | null>(null);
  const [bookReviews, setBookReviews] = React.useState<any[]>([]);
  const [featuredLimit, setFeaturedLimit] = React.useState(4);
  const [newArrivalsLimit, setNewArrivalsLimit] = React.useState(4);

  // Get user location
  React.useEffect(() => {
    const getLocation = async () => {
      try {
        if (user?.latitude && user?.longitude) {
          setUserLocation({ latitude: user.latitude, longitude: user.longitude });
        } else {
          try {
            const location = await getCurrentLocation();
            setUserLocation(location);
          } catch (error) {
            console.log("Location access denied or unavailable");
          }
        }
      } catch (error) {
        console.log("Error getting location:", error);
      }
    };
    getLocation();
  }, [user]);

  // Fetch public settings for display limits
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getPublicSettings();
        if (res.success && res.data) {
          setFeaturedLimit(res.data.featured_listings_limit || 4);
          setNewArrivalsLimit(res.data.new_arrivals_limit || 4);
        }
      } catch (error) {
        console.log("Using default limits");
      }
    };
    fetchSettings();
  }, []);

  // Fetch books with search filter
  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        
        // Build query with search parameter
        const searchParam = searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : '';
        
        const [featuredRes, newRes, allRes] = await Promise.all([
          bookService.getAll(`${searchParam}isFeatured=true&sort=-views&limit=${featuredLimit}&available=true`),
          bookService.getAll(`${searchParam}sort=-views,-createdAt&limit=${newArrivalsLimit}&available=true`),
          bookService.getAll(`${searchParam}limit=8&available=true`),
        ]);
        const processBooks = (res: any) => {
          if (res.success && res.books) {
            let data = res.books;
            if (userLocation) {
              data = sortByDistance(data, userLocation.latitude, userLocation.longitude);
            }
            return data;
          }
          return [];
        };
        setFeaturedBooks(processBooks(featuredRes));
        setNewArrivals(processBooks(newRes));
        setAllBooks(processBooks(allRes));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading books:", error);
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, [userLocation, searchQuery, featuredLimit, newArrivalsLimit]);

  // Fetch owner stats for the first featured book's owner (if any)
  React.useEffect(() => {
    const fetchOwnerStats = async () => {
      if (featuredBooks.length > 0 && featuredBooks[0].ownerId) {
        const stats = await reviewService.getOwnerStats(featuredBooks[0].ownerId);
        if (stats.success) setOwnerStats({ averageRating: stats.averageRating, reviewCount: stats.reviewCount });
      }
    };
    fetchOwnerStats();
  }, [featuredBooks]);

  // Fetch recent reviews for the first featured book
  React.useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        // Fetch all reviews (limited to 3 most recent)
        const res = await reviewService.getAll(3);
        if (res.success && res.reviews) {
          setBookReviews(res.reviews);
        }
      } catch (error) {
        console.log("Could not fetch recent reviews");
      }
    };
    fetchRecentReviews();
  }, []);

  const BookCard = ({ book }: { book: any }) => (
    <Link href={`/books/${book._id}`}> 
      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group">
        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <BookOpen className="h-12 w-12" />
            </div>
          )}
          {book.distance !== undefined && (
            <Badge className="absolute top-2 right-2">
              <MapPin className="h-3 w-3 mr-1" />
              {formatDistance(book.distance)}
            </Badge>
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-1 text-lg font-medium">{book.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="font-bold text-lg text-primary">Rs. {book.price}</span>
          <Badge variant="outline">{book.category}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[350px] bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="container max-w-7xl py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Find your Next Great Read</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
          Search for books by title, author, or genre from sellers near you
        </p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by title, author, or ISBN" 
            className="pl-10 h-12 text-base" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Featured Listings */}
      {!searchQuery && (
        <section id="search-results" className="container max-w-7xl py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Featured Listings</h2>
            <p className="text-muted-foreground text-sm">Selling and finding books is simple, secure, and sustainable</p>
          </div>
          {isLoading ? <LoadingGrid /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredBooks.length > 0 ? featuredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              )) : (
                <div className="col-span-full text-center text-muted-foreground">No featured books found</div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Owner Stats (if available) */}
      {!searchQuery && ownerStats && (
        <section className="container max-w-7xl py-12 bg-muted/20 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Owner Rating</h2>
          <div className="flex items-center justify-center gap-4">
            <RatingDisplay rating={ownerStats.averageRating} showValue={true} size="lg" />
            <span className="text-muted-foreground">{ownerStats.reviewCount} reviews</span>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      {!searchQuery && (
        <section className="container max-w-7xl py-16 bg-muted/50">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground text-sm">Explore our wide range of book categories</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[{ icon: BookOpen, label: "Fiction", desc: "Explore novels, short stories and more" },
              { icon: Hourglass, label: "History", desc: "Journey through the past with our collection" },
              { icon: Rocket, label: "Sci-Fi", desc: "Discover alien worlds and future possibilities" },
              { icon: User, label: "Biography", desc: "Read about the lives of fascinating people" },
            ].map((cat, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <cat.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold mb-2">{cat.label}</h3>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {!searchQuery && (
        <section className="container max-w-7xl py-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground text-sm">Freshly added to our collection</p>
            </div>
            <Link href="/books">
              <Button variant="link" className="p-0 h-auto">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          {isLoading ? <LoadingGrid /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.length > 0 ? newArrivals.map((book) => (
                <BookCard key={book._id} book={book} />
              )) : (
                <div className="col-span-full text-center text-muted-foreground">No new arrivals</div>
              )}
            </div>
          )}
        </section>
      )}

      {/* How It Works */}
      {!searchQuery && (
        <section className="container max-w-7xl py-20 bg-muted/50">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground text-sm">Listing and finding books is simple, secure, and sustainable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto text-center">
            {[{ icon: FileText, title: "Add Details", desc: "Enter book title, author, and ISBN details" },
              { icon: Camera, title: "Upload Photos", desc: "Showcase your book with clear pictures" },
              { icon: Banknote, title: "Set Price", desc: "Choose your price and pickup location" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mb-6 text-primary shadow-sm">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Books / Search Results */}
      <section id={searchQuery ? "search-results" : "all-books"} className="container max-w-7xl py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">{searchQuery ? "Search Results" : "All Books"}</h2>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? `Showing results for "${searchQuery}"` : "Browse our complete collection"}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/books">
              <Button variant="link" className="p-0 h-auto">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          )}
          {searchQuery && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
        {isLoading ? <LoadingGrid /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allBooks.length > 0 ? allBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any books matching "{searchQuery}"
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                  }}
                >
                  View All Books
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Platform Testimonials - What Our Reviews */}
      {!searchQuery && (
        <section className="container max-w-7xl py-20 bg-background">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What Our Reviews</h2>
            <p className="text-muted-foreground text-sm">Hear from our Most Popular Book Readers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah K.",
                role: "Book Reader",
                rating: 5,
                review: "I've found so many gems on BookLocator that I couldn't find anywhere else. The process is incredibly simple, and I love connecting with fellow readers."
              },
              {
                name: "Sarah K.",
                role: "Book Reader",
                rating: 5,
                review: "I've found so many gems on BookLocator that I couldn't find anywhere else. The process is incredibly simple, and I love connecting with fellow readers."
              },
              {
                name: "Sarah K.",
                role: "Book Reader",
                rating: 5,
                review: "I've found so many gems on BookLocator that I couldn't find anywhere else. The process is incredibly simple, and I love connecting with fellow readers."
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.review}"</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Book Reviews (for first featured book) */}
      {!searchQuery && bookReviews.length > 0 && (
        <section className="container max-w-7xl py-20 bg-muted/30">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-2">Recent Reviews</h2>
            <p className="text-muted-foreground text-sm">What readers are saying about their books</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookReviews.map((rev, i) => (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                {/* Book Info with Image */}
                <Link href={`/books/${rev.book?._id || '#'}`} className="flex gap-3 mb-4 group">
                  <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {rev.book?.image ? (
                      <img 
                        src={rev.book.image} 
                        alt={rev.book.title || 'Book'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {rev.book?.title || 'Unknown Book'}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <RatingDisplay rating={rev.rating} maxRating={5} size="sm" showValue={false} />
                    </div>
                  </div>
                </Link>
                
                {/* Reviewer Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {rev.reviewer?.image ? (
                      <img 
                        src={rev.reviewer.image} 
                        alt={rev.reviewer.name || 'Reviewer'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">{rev.reviewer?.name || "Anonymous"}</h5>
                    <p className="text-xs text-muted-foreground">{rev.reviewer?.email || ""}</p>
                  </div>
                </div>
                
                {/* Review Comment */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  "{rev.comment}"
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Values */}
      {!searchQuery && (
        <section className="container max-w-7xl py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[{ icon: Gem, title: "Great Value", desc: "Find affordable books from local sellers" },
              { icon: Leaf, title: "Sustainable Choice", desc: "Give pre-loved books a new home" },
              { icon: Search, title: "Find Hidden Gems", desc: "Discover rare and unique editions" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
