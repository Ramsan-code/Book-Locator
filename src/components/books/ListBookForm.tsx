"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ChevronLeft, Check, Link2, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { bookService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";

const CATEGORIES = [
  "Fiction",
  "Non-fiction",
  "Education",
  "Comics",
  "Other",
];

const CONDITIONS = [
  { value: "New", label: "New - Like new condition" },
  { value: "Good", label: "Good - Some wear, fully readable" },
  { value: "Used", label: "Used - Noticeable wear but usable" },
];

export function ListBookForm() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    title: "",
    author: "",
    category: "",
    condition: "",
    description: "",
    listingType: "sale",
    price: "",
    rentalDuration: "",
    address: "",
    latitude: "",
    longitude: "",
    image: "",
  });

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});


  // Progress calculation
  const progress = (currentStep / 3) * 100;

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Parse Google Maps URL to extract coordinates
  const parseGoogleMapsUrl = (url: string): { lat: number; lng: number } | null => {
    try {
      // Pattern 1: https://maps.google.com/?q=lat,lng
      const pattern1 = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const match1 = url.match(pattern1);
      if (match1) {
        return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
      }

      // Pattern 2: https://www.google.com/maps/@lat,lng,zoom
      const pattern2 = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const match2 = url.match(pattern2);
      if (match2) {
        return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
      }

      // Pattern 3: https://www.google.com/maps/place/.../@lat,lng
      const pattern3 = /@(-?\d+\.?\d*),(-?\d+\.?\d*),/;
      const match3 = url.match(pattern3);
      if (match3) {
        return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) };
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Handle Google Maps URL paste
  const handleMapUrlPaste = (url: string) => {
    const coords = parseGoogleMapsUrl(url);
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        latitude: coords.lat.toString(),
        longitude: coords.lng.toString(),
      }));
      toast.success("Location extracted from URL successfully!");
    } else {
      toast.error("Could not extract coordinates from URL. Please check the format.");
    }
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.loading("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        toast.success("Location detected successfully!");
      },
      (error) => {
        toast.error("Failed to get location: " + error.message);
      }
    );
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      if (!token) {
        toast.error("Please login to upload images");
        return;
      }
      
      const response = await bookService.uploadImage(token, file);
      if (response && response.image) {
        // Prepend API URL if path is relative
        const imageUrl = response.image.startsWith("http") 
          ? response.image 
          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${response.image}`;
          
        setFormData(prev => ({ ...prev, image: imageUrl }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      // Clear preview on error
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: "" }));
  };

  // Validate step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.author.trim()) newErrors.author = "Author is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.condition) newErrors.condition = "Condition is required";
    }

    if (step === 2) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Valid price is required";
      }
    }

    if (step === 3) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.latitude || !formData.longitude) {
        newErrors.address = "Please provide location coordinates (use Google Maps URL, manual entry, or current location)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async () => {
    console.log("=== SUBMIT CLICKED ===");
    console.log("Form data:", formData);
    console.log("User:", user);
    console.log("Token:", token ? "exists" : "missing");

    if (!validateStep(3)) {
      console.log("Validation failed for step 3");
      console.log("Errors:", errors);
      return;
    }

    console.log("Validation passed!");

    // Check authentication
    if (!user || !token) {
      console.log("Authentication failed - user or token missing");
      toast.error("Please login to list a book");
      return;
    }

    console.log("Authentication passed!");

    setIsSubmitting(true);
    try {
      // Prepare book data
      const bookData = {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        condition: formData.condition,
        description: formData.description,
        price: parseFloat(formData.price),
        location: {
          type: "Point",
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        },
        owner: user._id,
        image: formData.image,
      };

      console.log("Book data prepared:", bookData);
      console.log("Sending request to API...");

      const response = await bookService.create(token, bookData);

      console.log("API response:", response);

      // Backend returns the book object directly on success
      if (response && (response._id || response.book)) {
        toast.success("Book listed successfully! Pending admin approval.");
        router.push("/my-books");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Book creation error:", error);
      toast.error(error.message || "Failed to list book");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Require authentication
  /*
  if (!user) {
    return (
      <div className="container py-20 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to list a book</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginModal id="list-book-login-modal">
              <Button className="w-full bg-success hover:bg-success/90">Login Now</Button>
            </LoginModal>
          </CardContent>
        </Card>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8">
      <div className="container max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">List Your Book</h1>
          <p className="text-muted-foreground">
            Fill in the details below to list your book on the marketplace
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-sm font-medium">Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 3 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium">Location</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="backdrop-blur-sm bg-card/50 border-2">
          <CardContent className="p-6">
            {/* Step 1: Book Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Book Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us about the book you're listing
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., The Hitchhiker's Guide to the Galaxy"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      placeholder="e.g., Douglas Adams"
                      value={formData.author}
                      onChange={(e) => handleChange("author", e.target.value)}
                      className={errors.author ? "border-destructive" : ""}
                    />
                    {errors.author && <p className="text-sm text-destructive mt-1">{errors.author}</p>}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)}>
                      <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && <p className="text-sm text-destructive mt-1">{errors.condition}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional details about the book..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Book Cover Image</Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative w-full max-w-[200px] aspect-[2/3] rounded-lg overflow-hidden border bg-muted group">
                          <img 
                            src={imagePreview} 
                            alt="Book cover preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors border-muted-foreground/25 hover:border-muted-foreground/50"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or GIF (MAX. 5MB)
                              </p>
                            </div>
                            <input 
                              id="image-upload" 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Set Price</h2>
                  <p className="text-sm text-muted-foreground">
                    Set the selling price for your book
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">Sale Price (Rs.) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className={errors.price ? "border-destructive" : ""}
                      min="0"
                      step="1"
                    />
                    {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
                  </div>

                  <Card className="bg-success/10 border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-success rounded-full p-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Pricing Tips</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Research similar books to set competitive prices</li>
                            <li>• Consider the book's condition when pricing</li>
                            <li>• Fair prices sell faster!</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Location</h2>
                  <p className="text-sm text-muted-foreground">
                    Add pickup location
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Google Maps URL Input */}
                  <Card className="bg-info/10 border-info/20">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-info rounded-full p-2">
                            <Link2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">Paste Google Maps Link</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              Open Google Maps, find your location, copy the URL and paste it here
                            </p>
                            <Input
                              placeholder="https://www.google.com/maps/@12.9716,77.5946,15z"
                              onChange={(e) => {
                                const url = e.target.value;
                                if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
                                  handleMapUrlPaste(url);
                                }
                              }}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Manual Location Entry */}
                  <div>
                    <Label htmlFor="address">Pickup Address *</Label>
                    <Input
                      id="address"
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 12.9716"
                        value={formData.latitude}
                        onChange={(e) => handleChange("latitude", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 77.5946"
                        value={formData.longitude}
                        onChange={(e) => handleChange("longitude", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Get Current Location Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use My Current Location
                  </Button>

                  {/* Location Preview */}
                  {formData.latitude && formData.longitude && (
                    <Card className="bg-success/10 border-success/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-success rounded-full p-2">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Location Set</h4>
                            <p className="text-xs text-muted-foreground">
                              Coordinates: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                            </p>
                            <a
                              href={`https://www.google.com/maps/@${formData.latitude},${formData.longitude},15z`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-info hover:underline"
                            >
                              View on Google Maps →
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  </div>
                </div>

            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-success hover:bg-success/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-success hover:bg-success/90"
                >
                  {isSubmitting ? "Listing..." : "List Book"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
