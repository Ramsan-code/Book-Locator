"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone_no: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="space-y-3">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <FieldLabel className="text-sm font-medium text-foreground/90">Full Name</FieldLabel>
              <Input
                {...field}
                placeholder="John Doe"
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20 h-12 rounded-xl transition-all hover:bg-background/80"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <FieldLabel className="text-sm font-medium text-foreground/90">Email Address</FieldLabel>
              <Input
                {...field}
                type="email"
                placeholder="john@example.com"
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20 h-12 rounded-xl transition-all hover:bg-background/80"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <FieldLabel className="text-sm font-medium text-foreground/90">Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20 h-12 rounded-xl pr-10 transition-all hover:bg-background/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="phone_no"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <FieldLabel className="text-sm font-medium text-foreground/90">Phone Number (Optional)</FieldLabel>
              <Input
                {...field}
                type="tel"
                placeholder="+94 77 123 4567"
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20 h-12 rounded-xl transition-all hover:bg-background/80"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <FieldLabel className="text-sm font-medium text-foreground/90">Address (Optional)</FieldLabel>
              <Input
                {...field}
                placeholder="City, Country"
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20 h-12 rounded-xl transition-all hover:bg-background/80"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Field className="space-y-2">
          <FieldLabel className="text-sm font-medium text-foreground/90">Location (Optional)</FieldLabel>
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            disabled={isGettingLocation || isLoading}
            className="w-full h-12 bg-background/30 border-white/10 hover:bg-background/50 hover:text-foreground text-muted-foreground rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Get Current Location
          </Button>
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

      <div className="space-y-4">
        <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/20" 
            disabled={isLoading}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register
        </Button>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-600 dark:text-blue-400 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-semibold mb-1 text-base">
                <span>⏳</span> Approval Required
            </div>
            <p className="text-sm opacity-90">
            Your account will be reviewed by an admin before you can login.
            </p>
        </div>
      </div>
    </form>
  );
}
