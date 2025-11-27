"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin } from "lucide-react";
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
import { authApi } from "@/lib/api";
import { getCurrentLocation } from "@/lib/location";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      form.setValue("latitude", location.latitude);
      form.setValue("longitude", location.longitude);
      toast.success("Location captured successfully!");
    } catch (error) {
      toast.error("Failed to get location. You can skip this step.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "user", // Default role as per API
      };

      // Add location if captured
      if (data.latitude && data.longitude) {
        payload.location = {
          type: "Point",
          coordinates: [data.longitude, data.latitude],
        };
      }

      await authApi.register(payload);
      
      toast.success(
        "Registration successful! Please wait for admin approval before logging in.",
        { duration: 5000 }
      );
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Register to start buying and selling books in your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input {...form.register("name")} placeholder="John Doe" />
                {form.formState.errors.name && (
                  <FieldError errors={[form.formState.errors.name]} />
                )}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="john@example.com"
                />
                {form.formState.errors.email && (
                  <FieldError errors={[form.formState.errors.email]} />
                )}
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="••••••••"
                />
                {form.formState.errors.password && (
                  <FieldError errors={[form.formState.errors.password]} />
                )}
              </Field>

              <Field>
                <FieldLabel>Location (Optional)</FieldLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="w-full"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="mr-2 h-4 w-4" />
                    )}
                    Get Current Location
                  </Button>
                </div>
                {form.watch("latitude") && form.watch("longitude") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Location captured: {form.watch("latitude")?.toFixed(4)},{" "}
                    {form.watch("longitude")?.toFixed(4)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Location helps show you books nearby
                </p>
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium">⏳ Approval Required</p>
              <p className="text-xs mt-1">
                Your account will be reviewed by an admin before you can list or buy books.
                You'll receive an email once approved.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
