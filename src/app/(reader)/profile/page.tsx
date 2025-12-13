"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Camera, Star, Pencil, Trash2, Upload, Lock, AlertTriangle } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { reviewService, profileService, bookService } from "@/services";

export default function ProfilePage() {
  const { user, logout, checkAuth, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState<{
    averageRating: number;
    reviewCount: number;
    breakdown: { stars: number; percentage: number; count: number }[];
  }>({ 
    averageRating: 0, 
    reviewCount: 0,
    breakdown: [
      { stars: 5, percentage: 0, count: 0 },
      { stars: 4, percentage: 0, count: 0 },
      { stars: 3, percentage: 0, count: 0 },
      { stars: 2, percentage: 0, count: 0 },
      { stars: 1, percentage: 0, count: 0 },
    ]
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [city, setCity] = React.useState("");
  const [image, setImage] = React.useState("");

  // Password change dialog state
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Delete account dialog state
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

  // Initialize form state after mount to avoid hydration errors
  React.useEffect(() => {
    setMounted(true);
    if (user) {
      setDisplayName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone_no || "");

      setCity(user.city || "");
      setImage(user.image || "");
      
      // Fetch user's review stats
      const fetchStats = async () => {
        try {
          const ownerStats = await reviewService.getOwnerStats(user._id);
          if (ownerStats.success) {
            setStats({
              averageRating: ownerStats.averageRating,
              reviewCount: ownerStats.reviewCount,
              breakdown: ownerStats.breakdown || [
                { stars: 5, percentage: 0, count: 0 },
                { stars: 4, percentage: 0, count: 0 },
                { stars: 3, percentage: 0, count: 0 },
                { stars: 2, percentage: 0, count: 0 },
                { stars: 1, percentage: 0, count: 0 },
              ]
            });
          }
        } catch (error) {
          console.log("Using default stats");
        }
      };
      fetchStats();
    }
  }, [user]);

  // Redirect if not logged in (must be at top level, before any conditional returns)
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("booklink_token") || "";
      
      // Use bookService.uploadImage as a generic upload handler since it hits /api/upload
      const res = await bookService.uploadImage(token, file);
      if (res.image) {
        // Update local state
        setImage(res.image);
        
        // Save the image to profile in database
        const updateRes = await profileService.updateProfile(token, { image: res.image });
        if (updateRes.success) {
          toast.success("Profile picture updated successfully!");
          await checkAuth(); // Refresh global user state
        } else {
          toast.success("Image uploaded - please save to apply changes");
        }
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

  const handleRemoveImage = async () => {
    try {
      const token = localStorage.getItem("booklink_token") || "";
      setImage("");
      
      // Save the removal to database
      const updateRes = await profileService.updateProfile(token, { image: "" });
      if (updateRes.success) {
        toast.success("Profile picture removed!");
        await checkAuth(); // Refresh global user state
      } else {
        toast.error("Failed to remove picture");
      }
    } catch (error) {
      console.error("Remove image failed:", error);
      toast.error("Failed to remove picture");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Only save if changes were made
    console.log("Saving profile:", { email, phone, city });
    console.log("Current user:", { email: user.email, phone: user.phone_no, city: user.city });
    if (email === (user.email || "") && phone === (user.phone_no || "") && city === (user.city || "")) {
      toast.info("No changes to save");
      return;
    }

    try {
      const token = localStorage.getItem("booklink_token") || "";
      const updateRes = await profileService.updateProfile(token, {
        email,
        phone_no: phone,
        city,
      });

      if (updateRes.success) {
        toast.success("Profile updated successfully!");
        await checkAuth(); // Refresh global user state
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    }
  };



  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem("booklink_token");
      if (!token) return;

      const res = await profileService.changePassword(token, currentPassword, newPassword);
      
      if (res.success) {
        toast.success("Password changed successfully!");
        setShowPasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Failed to change password");
      }
    } catch (error: any) {
      console.error("Password change failed:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const token = localStorage.getItem("booklink_token");
      if (!token) return;

      const res = await profileService.deleteAccount(token);
      
      if (res.success) {
        toast.success("Account deleted successfully");
        setShowDeleteDialog(false);
        // Log out and redirect to home
        await logout();
        router.push("/");
      } else {
        toast.error("Failed to delete account");
      }
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Show loading state
  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Personal Info</h1>
            <p className="text-muted-foreground">
              Manage your personal details and public profile.
            </p>
          </div>
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
                {stats.breakdown.map((rating) => (
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
              <Button onClick={() => setShowPasswordDialog(true)} variant="outline">
                Change Password
              </Button>
            </div>
          </CardHeader>


        </Card>

        {/* Contact Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Manage your contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">District</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your district"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
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
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2">Warning:</h4>
                <ul className="text-sm text-destructive space-y-1 list-disc list-inside">
                  <li>All your book listings will be removed</li>
                  <li>Your transactions will be archived</li>
                  <li>Your profile and reviews will be deleted</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation">
                  Type <span className="font-bold">DELETE</span> to confirm
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE in capital letters"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmation !== "DELETE"}
              >
                {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
