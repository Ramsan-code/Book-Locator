"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { bookService, reviewService } from "@/services";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// Mock owner data
const MOCK_OWNERS: Record<string, any> = {
  owner1: {
    _id: "owner1",
    name: "Alex Johnson",
    email: "alex@example.com",
    location: { coordinates: [0, 0] },
    city: "Oakland, California",
  },
  owner2: {
    _id: "owner2",
    name: "Sarah Smith",
    email: "sarah@example.com",
    location: { coordinates: [0, 0] },
    city: "San Francisco, California",
  },
  owner3: {
    _id: "owner3",
    name: "Mike Brown",
    email: "mike@example.com",
    location: { coordinates: [0, 0] },
    city: "Los Angeles, California",
  },
  owner4: {
    _id: "owner4",
    name: "Emily Davis",
    email: "emily@example.com",
    location: { coordinates: [0, 0] },
    city: "Seattle, Washington",
  },
};

// Mock books by owner
const MOCK_BOOKS_BY_OWNER: Record<string, any[]> = {
  owner1: [
    {
      _id: "book1",
      title: "The Midnight Library",
      author: "Matt Haig",
      price: 299,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
      category: "Fiction",
    },
    {
      _id: "book2",
      title: "Project Hail Mary",
      author: "Andy Weir",
      price: 399,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop",
      category: "Science Fiction",
    },
    {
      _id: "book3",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      price: 349,
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
      category: "Fiction",
    },
    {
      _id: "book4",
      title: "The Four Winds",
      author: "Kristin Hannah",
      price: 429,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop",
      category: "Historical Fiction",
    },
  ],
};

export default function OwnerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [owner, setOwner] = React.useState<any>(null);
  const [books, setBooks] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ averageRating: 4.8, reviewCount: 142 });
  const [isLoading, setIsLoading] = React.useState(true);

  // Rating breakdown (mock data)
  const ratingBreakdown = [
    { stars: 5, percentage: 85, count: 121 },
    { stars: 4, percentage: 10, count: 14 },
    { stars: 3, percentage: 3, count: 4 },
    { stars: 2, percentage: 2, count: 3 },
    { stars: 1, percentage: 0, count: 0 },
  ];

  React.useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setIsLoading(true);
        // Use mock data for now
        const ownerId = params.id as string;
        const ownerData = MOCK_OWNERS[ownerId] || MOCK_OWNERS.owner1;
        const ownerBooks = MOCK_BOOKS_BY_OWNER[ownerId] || MOCK_BOOKS_BY_OWNER.owner1;
        
        setOwner(ownerData);
        setBooks(ownerBooks);
        
        // Try to fetch real stats if available
        try {
          const ownerStats = await reviewService.getOwnerStats(ownerId);
          if (ownerStats.success) {
            setStats({
              averageRating: ownerStats.averageRating,
              reviewCount: ownerStats.reviewCount,
            });
          }
        } catch (error) {
          console.log("Using mock stats");
        }
      } catch (error) {
        console.error("Error loading owner data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchOwnerData();
  }, [params.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!token) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-muted-foreground mb-6">Please log in to view this profile.</p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (!owner) {
    return <div className="container py-8">Owner not found</div>;
  }

  return (
    <>
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="container py-8 px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {/* Owner Profile Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={undefined} alt={owner.name} />
                  <AvatarFallback className="text-3xl font-bold">
                    {getInitials(owner.name)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold mb-2">{owner.name}</h1>
                {owner.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{owner.city}</span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Rating Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(stats.averageRating)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {stats.reviewCount} reviews
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-3">
                  {ratingBreakdown.map((rating) => (
                    <div key={rating.stars} className="flex items-center gap-3">
                      <span className="text-sm w-4">{rating.stars}</span>
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <Progress
                        value={rating.percentage}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {rating.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books from this Owner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">More Books from this Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {books.map((book) => (
                  <div
                    key={book._id}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/books/${book._id}`)}
                  >
                    <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-2 border group-hover:border-primary transition-colors">
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
                    <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1">{book.author}</p>
                    <p className="text-sm font-bold">Rs. {book.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
