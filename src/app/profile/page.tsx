"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, MapPin, Phone, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { profileApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_no: z.string().optional(),
  address: z.string().optional(),
  vehicle_no: z.string().optional(),
  vehicle_type: z.string().optional(),
});

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_no: "",
      address: "",
      vehicle_no: "",
      vehicle_type: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        phone_no: user.phone_no || "",
        address: user.address || "",
        vehicle_no: user.vehicle_no || "",
        vehicle_type: user.vehicle_type || "",
      });
    }
  }, [user, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token) return;
    setIsLoading(true);
    try {
      await profileApi.updateProfile(token, data);
      await refreshUser();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your profile</h2>
        <LoginModal>
          <Button>Login Now</Button>
        </LoginModal>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form id="form-profile" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    {...form.register("name")} 
                    className="pl-8" 
                    disabled={!isEditing} 
                  />
                </div>
                {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={user.email} disabled className="bg-gray-50" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </Field>

              <Field>
                <FieldLabel>Phone Number</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    {...form.register("phone_no")} 
                    className="pl-8" 
                    disabled={!isEditing} 
                    placeholder="+91 9876543210"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel>Address</FieldLabel>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    {...form.register("address")} 
                    className="pl-8" 
                    disabled={!isEditing} 
                    placeholder="123 Main St, City"
                  />
                </div>
              </Field>
            </FieldGroup>

            {isEditing && (
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
