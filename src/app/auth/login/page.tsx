"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Glass Card Container */}
      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        <div className="backdrop-blur-xl bg-card/30 border border-white/10 shadow-2xl rounded-2xl p-8 md:p-12 overflow-hidden relative">
          {/* Decorative shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            {/* Branding */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
                BookLocator
              </h1>
              <p className="text-muted-foreground text-sm md:text-base animate-fade-in delay-100">
                Your gateway to a world of stories
              </p>
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            
            <LoginForm onSuccess={() => router.push('/')} />

            <div className="text-center text-sm text-muted-foreground pt-4">
              Don&apos;t have an account?{" "}
              <Link 
                href="/auth/register" 
                className="text-primary font-medium hover:text-primary/80 hover:underline transition-all duration-300"
              >
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}