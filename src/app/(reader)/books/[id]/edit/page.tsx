"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  "Other",
];

const CONDITIONS = ["New", "Good", "Used", "Bad", "Damaged", "Other"];

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const bookId = params.id as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [book, setBook] = React.useState<any>(null);

  // Form state
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [condition, setCondition] = React.useState("");

  // Fetch book data
  React.useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const res = await bookService.getOne(bookId);
        if (res.success && res.book) {
          const b = res.book;
          setBook(b);
          setTitle(b.title || "");
          setAuthor(b.author || "");
          setDescription(b.description || "");
          setPrice(b.price?.toString() || "");
          setCategory(b.category || "");
          setCondition(b.condition || "");
        } else {
          toast.error("Book not found");
          router.push("/my-books");
        }
      } catch (error) {
        console.error("Failed to fetch book:", error);
        toast.error("Failed to load book");
        router.push("/my-books");
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) fetchBook();
  }, [bookId, router]);

  const handleSave = async () => {
    if (!token || !bookId) return;

    if (!title.trim() || !author.trim() || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        condition,
      };

      const res = await bookService.update(token, bookId, updateData);
      if (res.success) {
        toast.success("Book updated successfully!");
        router.push("/my-books");
      } else {
        toast.error(res.message || "Failed to update book");
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update book");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <Button onClick={() => router.push("/my-books")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Book</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Book Image Preview */}
          {book.image && (
            <div className="flex justify-center">
              <img
                src={book.image}
                alt={title}
                className="h-48 w-auto rounded-lg object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter book description"
              rows={4}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (Rs.) *</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              min="0"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
