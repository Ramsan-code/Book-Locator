"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { booksApi, transactionsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [book, setBook] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRequesting, setIsRequesting] = React.useState(false);

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
             "691fff37ab97832539568300": { _id: "691fff37ab97832539568300", title: "MahaBaratham", author: "Kalki", price: 1500.99, category: "Fiction", condition: "Good", description: "A classic epic.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop" },
             "691febd4c40fa5f20bd30fc9": { _id: "691febd4c40fa5f20bd30fc9", title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99, category: "Fiction", condition: "Good", description: "A story of decadence and excess.", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop" },
             "691d6b1c61e3fa1f9ea250db": { _id: "691d6b1c61e3fa1f9ea250db", title: "The Alchemist", author: "Paulo Coelho", price: 1200, category: "Fiction", condition: "Good", description: "A journey of self-discovery.", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop" },
             "691c1e8a84da0fa4b2140ead": { _id: "691c1e8a84da0fa4b2140ead", title: "The Great", author: "Ramshan", price: 12.99, category: "Fiction", condition: "Good", description: "An amazing book.", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop" },
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

  const handleRequestBook = async () => {
    if (!user || !token) return;

    setIsRequesting(true);
    try {
      await transactionsApi.create(token, { bookId: book._id });
      toast.success("Book requested successfully!");
      router.push("/transactions");
    } catch (error) {
      toast.error("Failed to request book");
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) return <div className="container py-8">Loading...</div>;
  if (!book) return <div className="container py-8">Book not found</div>;

  return (
    <div className="container py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Section */}
        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden shadow-md">
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
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {book.category}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {book.condition}
            </Badge>
          </div>

          <div className="text-3xl font-bold text-primary mb-8">
            Rs. {book.price}
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {book.description || "No description available for this book."}
            </p>
          </div>

          <Separator className="my-6" />

          <div className="mt-auto">
            {user ? (
              <Button 
                size="lg" 
                className="w-full md:w-auto text-lg px-8"
                onClick={handleRequestBook}
                disabled={isRequesting}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isRequesting ? "Requesting..." : "Request Book"}
              </Button>
            ) : (
              <LoginModal>
                <Button size="lg" className="w-full md:w-auto text-lg px-8">
                  Login to Request
                </Button>
              </LoginModal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
