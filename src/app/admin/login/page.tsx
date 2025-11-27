"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

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
      // TODO: Implement actual admin authentication
      toast.success("Admin login successful");
      router.push("/admin");
    } catch (error) {
      toast.error("Invalid admin credentials");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
      <Card className="w-full sm:max-w-[400px] shadow-lg border-gray-100">
        <CardHeader className="space-y-1 text-center pt-10">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-gray-900" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm">
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
                    <FieldLabel htmlFor="form-admin-login-email" className="text-sm font-medium text-gray-900 flex items-center gap-2">
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
                      className="h-11 bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-md"
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
                    <FieldLabel htmlFor="form-admin-login-password" className="text-sm font-medium text-gray-900 flex items-center gap-2">
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
                      className="h-11 bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-md"
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
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
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
          <div className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-gray-900 font-semibold hover:underline">
              Create one now
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
