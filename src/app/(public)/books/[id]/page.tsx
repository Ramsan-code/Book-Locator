"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Heart, ShoppingBag, MapPin, Link as LinkIcon, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { booksApi, transactionsApi, reviewsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { calculateDistance, formatDistance } from "@/lib/location";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { OwnerProfile } from "@/components/books/OwnerProfile";
import { BottomNav } from "@/components/layout/BottomNav";

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [book, setBook] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [ownerStats, setOwnerStats] = React.useState<{ averageRating: number; reviewCount: number }>({ averageRating: 0, reviewCount: 0 });
  const [distance, setDistance] = React.useState<number | null>(null);
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const res = await booksApi.getOne(params.id as string).catch(() => ({ success: false, book: null }));
        if (res.success && res.book) {
          setBook(res.book);
        } else {
           // Fallback Mock Data matching README
           const mockBooks: Record<string, any> = {
             "691fff37ab97832539568300": { 
               _id: "691fff37ab97832539568300", 
               title: "MahaBaratham", 
               author: "Kalki", 
               price: 1500.99, 
               category: "Fiction", 
               condition: "Good", 
               description: "A classic epic.", 
               image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
               available: true,
               owner: {
                 _id: "owner1",
                 name: "Alex Johnson",
                 email: "alex@example.com",
                 location: { coordinates: [0, 0] }
               }
             },
             "691febd4c40fa5f20bd30fc9": { 
               _id: "691febd4c40fa5f20bd30fc9", 
               title: "The Great Gatsby", 
               author: "F. Scott Fitzgerald", 
               price: 15.99, 
               category: "Fiction", 
               condition: "Good", 
               description: "A story of decadence and excess.", 
               image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
               available: true,
               owner: {
                 _id: "owner2",
                 name: "Sarah Smith",
                 email: "sarah@example.com",
                 location: { coordinates: [0, 0] }
               }
             },
             "691d6b1c61e3fa1f9ea250db": { 
               _id: "691d6b1c61e3fa1f9ea250db", 
               title: "The Alchemist", 
               author: "Paulo Coelho", 
               price: 1200, 
               category: "Fiction", 
               condition: "Good", 
               description: "A journey of self-discovery.", 
               image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
               available: true,
               owner: {
                 _id: "owner3",
                 name: "Mike Brown",
                 email: "mike@example.com",
                 location: { coordinates: [0, 0] }
               }
             },
             "691c1e8a84da0fa4b2140ead": { 
               _id: "691c1e8a84da0fa4b2140ead", 
               title: "The Great", 
               author: "Ramshan", 
               price: 12.99, 
               category: "Fiction", 
               condition: "Good", 
               description: "An amazing book.", 
               image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
               available: true,
               owner: {
                 _id: "owner4",
                 name: "Emily Davis",
                 email: "emily@example.com",
                 location: { coordinates: [0, 0] }
               }
             },
           };
           setBook(mockBooks[params.id as string] || mockBooks["691fff37ab97832539568300"]);
        }
      } catch (error) {
        toast.error("Failed to load book details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchBook();
  }, [params.id]);

  // Check if book is in favorites
  React.useEffect(() => {
    if (params.id) {
      const favorites = JSON.parse(localStorage.getItem("book-locator-favorites") || "[]");
      setIsFavorite(favorites.includes(params.id));
    }
  }, [params.id]);

  // Fetch reviews
  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewsApi.getByBook(params.id as string);
        if (res.success) {
          setReviews(res.reviews || []);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };
    fetchReviews();
  }, [params.id]);

  // Fetch owner stats
  React.useEffect(() => {
    const fetchOwnerStats = async () => {
      if (book?.owner?._id) {
        const stats = await reviewsApi.getOwnerStats(book.owner._id);
        if (stats.success) {
          setOwnerStats({
            averageRating: stats.averageRating,
            reviewCount: stats.reviewCount,
          });
        }
      }
    };
    fetchOwnerStats();
  }, [book?.owner?._id]);

  // Calculate distance from user to book
  React.useEffect(() => {
    if (user?.latitude && user?.longitude && book?.latitude && book?.longitude) {
      const dist = calculateDistance(
        user.latitude,
        user.longitude,
        book.latitude,
        book.longitude
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [user, book]);

  const handleRequestBook = async () => {
    if (!user || !token) return;

    setIsRequesting(true);
    try {
      await transactionsApi.create(token, { bookId: book._id });
      toast.success("Book requested successfully!");
      router.push("/my-transactions");
    } catch (error: any) {
      toast.error(error.message || "Failed to request book");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    if (!token) return;
    setIsSubmittingReview(true);
    try {
      const res = await reviewsApi.create(token, params.id as string, data);
      if (res.success) {
        setReviews([res.review, ...reviews]);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    try {
      await reviewsApi.delete(token, reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("book-locator-favorites") || "[]");
    const bookId = params.id as string;
    
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== bookId);
      localStorage.setItem("book-locator-favorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      favorites.push(bookId);
      localStorage.setItem("book-locator-favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  if (isLoading) return <div className="container py-8">Loading...</div>;
  if (!book) return <div className="container py-8">Book not found</div>;

  return (
    <>
      <div className="min-h-screen">
        <div className="container py-8 px-4 pb-24 md:pb-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
          </Button>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8">
              {/* Image Section */}
              <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg border">
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
              </div>

              {/* Details Section */}
              <div className="flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
                    <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share this book</DialogTitle>
                          <DialogDescription>
                            Share this book with your friends and network.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                              Link
                            </Label>
                            <Input
                              id="link"
                              defaultValue={typeof window !== 'undefined' ? window.location.href : ''}
                              readOnly
                            />
                          </div>
                          <Button type="submit" size="sm" className="px-3" onClick={handleShare}>
                            <span className="sr-only">Copy</span>
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-center gap-4 py-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full hover:bg-[#25D366] hover:text-white transition-colors"
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${book.title} on Book Locator: ${window.location.href}`)}`, '_blank')}
                          >
                            <MessageCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full hover:bg-[#1DA1F2] hover:text-white transition-colors"
                            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${book.title} on Book Locator`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                          >
                            <Twitter className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full hover:bg-[#4267B2] hover:text-white transition-colors"
                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                          >
                            <Facebook className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full hover:bg-[#0077b5] hover:text-white transition-colors"
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                          >
                            <Linkedin className="h-5 w-5" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {book.available ? (
                    <Badge className="text-sm px-3 py-1">
                      For Sale
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      Sold
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {book.condition === "New" ? "Like New" : book.condition}
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {book.category}
                  </Badge>
                </div>

                {/* Distance Badge */}
                {distance !== null && (
                  <div className="mb-6">
                    <Badge variant="outline" className="text-base px-4 py-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      {formatDistance(distance)} from you
                    </Badge>
                  </div>
                )}

                <div className="text-3xl font-bold mb-8">
                  ${book.price}
                </div>

                {/* Owner Profile Section */}
                {book.owner && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">Owner</h3>
                    <OwnerProfile
                      owner={book.owner}
                      averageRating={ownerStats.averageRating}
                      reviewCount={ownerStats.reviewCount}
                    />
                  </div>
                )}

                <Separator className="my-6" />

                <div className="prose max-w-none mb-8">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description || "No description available for this book."}
                  </p>
                </div>

                <Separator className="my-6 bg-emerald-900/30" />

                <div className="mt-auto">
                  {user ? (
                    user.role === 'admin' ? (
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground text-center">
                          <strong>Admin View:</strong> You can browse books but cannot make purchase requests.
                        </p>
                      </div>
                    ) : (
                      <Button 
                        size="lg" 
                        className="w-full md:w-auto text-lg px-8"
                        onClick={handleRequestBook}
                        disabled={isRequesting || !book.available}
                      >
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        {isRequesting ? "Requesting..." : book.available ? "Send Request to Owner" : "Not Available"}
                      </Button>
                    )
                  ) : (
                    <LoginModal id="book-details-login-modal">
                      <Button size="lg" className="w-full md:w-auto text-lg px-8">
                        Login to Request
                      </Button>
                    </LoginModal>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews Section */}
          <div className="container max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ReviewList
                  reviews={reviews}
                  currentUserId={user?._id}
                  onDelete={handleDeleteReview}
                />
              </div>
              <div>
                {user ? (
                  <ReviewForm
                    onSubmit={handleSubmitReview}
                    isSubmitting={isSubmittingReview}
                  />
                ) : (
                  <LoginModal id="review-login-modal">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Login to Write a Review
                    </Button>
                  </LoginModal>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
