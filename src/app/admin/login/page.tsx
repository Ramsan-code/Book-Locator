"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const formSchema = z.object({
  email: z
    .string()
    .min(5, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Use AuthContext login which handles everything properly
      await login(data);
      
      // Note: The login function in AuthContext will:
      // 1. Call the API
      // 2. Check the user role
      // 3. Redirect to /admin if role is admin
      // 4. Save token and user properly
    } catch (error: any) {
      // Check if it's an access denied error (non-admin trying to login)
      if (error.message?.includes('admin')) {
        toast.error('Access denied. Admin credentials required.');
      }
      // Other errors are already handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full sm:max-w-[400px] shadow-lg border-border">
        <CardHeader className="space-y-1 text-center pt-10">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <LogIn className="h-6 w-6 text-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <form id="form-admin-login" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel htmlFor="form-admin-login-email" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-admin-login-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="you@example.com"
                      autoComplete="email"
                      type="email"
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring rounded-md"
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
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel htmlFor="form-admin-login-password" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-admin-login-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      type="password"
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring rounded-md"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 pt-4 pb-10">
          <Button
            type="submit"
            form="form-admin-login"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <span className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Sign In
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
