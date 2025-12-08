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
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentLocation } from "@/lib/location";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone_no: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone_no: "",
      address: "",
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
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone_no: data.phone_no,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        role: "user",
      });
    } catch (error: any) {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Register to start reading and sharing books
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
                <FieldLabel>Phone Number (Optional)</FieldLabel>
                <Input
                  {...form.register("phone_no")}
                  type="tel"
                  placeholder="+94 77 123 4567"
                />
                {form.formState.errors.phone_no && (
                  <FieldError errors={[form.formState.errors.phone_no]} />
                )}
              </Field>

              <Field>
                <FieldLabel>Address (Optional)</FieldLabel>
                <Input
                  {...form.register("address")}
                  placeholder="City, Country"
                />
                {form.formState.errors.address && (
                  <FieldError errors={[form.formState.errors.address]} />
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
                    Location captured
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Helps find books nearby. Your exact location is never shown.
                </p>
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>

            <div className="bg-info/10 border border-info/20 rounded-lg p-3 text-sm text-info">
              <p className="font-medium">⏳ Approval Required</p>
              <p className="text-xs mt-1">
                Your account will be reviewed by an admin before you can login.
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
