"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Camera, Star, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { reviewService, profileService, bookService } from "@/services";

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState({ averageRating: 4.5, reviewCount: 28 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [image, setImage] = React.useState("");

  // Rating breakdown (mock data)
  const ratingBreakdown = [
    { stars: 5, percentage: 75, count: 21 },
    { stars: 4, percentage: 15, count: 4 },
    { stars: 3, percentage: 7, count: 2 },
    { stars: 2, percentage: 3, count: 1 },
    { stars: 1, percentage: 0, count: 0 },
  ];

  // Initialize form state after mount to avoid hydration errors
  React.useEffect(() => {
    setMounted(true);
    if (user) {
      setDisplayName(user.name || "");
      setLocation(user.address || user.city || "");
      setEmail(user.email || "");
      setPhone(user.phone_no || "");
      setImage(user.image || "");
      
      // Fetch user's review stats
      const fetchStats = async () => {
        try {
          const ownerStats = await reviewService.getOwnerStats(user._id);
          if (ownerStats.success) {
            setStats({
              averageRating: ownerStats.averageRating,
              reviewCount: ownerStats.reviewCount,
            });
          }
        } catch (error) {
          console.log("Using mock stats");
        }
      };
      fetchStats();
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // Use bookService.uploadImage as a generic upload handler since it hits /api/upload
      const res = await bookService.uploadImage(localStorage.getItem("token") || "", file);
      if (res.image) {
        setImage(res.image);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    toast.success("Image removed. Click Save Changes to apply.");
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const updateData = {
        name: displayName,
        location: location,
        email: email,
        image: image, // Send the image URL
      };

      const res = await profileService.updateProfile(token, updateData);
      
      if (res.success) {
        toast.success("Profile updated successfully!");
        // Refresh auth context to update user data across the app
        await checkAuth();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    toast.info("Password change functionality coming soon!");
  };

  // Show loading state
  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Personal Info</h1>
            <p className="text-muted-foreground">
              Manage your personal details and public profile.
            </p>
          </div>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>

        {/* Profile Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Update your profile information visible to other users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={image} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a profile picture to personalize your account.
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                {image ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isUploading}>
                        {isUploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Pencil className="mr-2 h-4 w-4" />
                        )}
                        Edit Photo
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRemoveImage} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Photo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="mr-2 h-4 w-4" />
                    )}
                    Upload Photo
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* My Reviews Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Reviews</CardTitle>
            <CardDescription>
              Reviews and ratings you've received from other users.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

        {/* Account Settings Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account security and preferences.
                </CardDescription>
              </div>
              <Button onClick={handleChangePassword} variant="outline">
                Change Password
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => toast.error("Account deletion is not available yet")}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
