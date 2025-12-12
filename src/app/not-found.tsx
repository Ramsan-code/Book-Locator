"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 Number */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-primary/10 select-none leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-20 w-20 md:h-28 md:w-28 text-primary animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off the shelf. 
            Let's help you find your way back.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-6 bg-transparent border-border/40 hover:bg-muted/30 hover:text-foreground text-muted-foreground rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Link href="/">
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-6 bg-transparent border-border/40 hover:bg-muted/30 hover:text-foreground text-muted-foreground rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Link href="/books">
              <Search className="h-5 w-5" />
              Browse Books
            </Link>
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="pt-8 flex items-center justify-center gap-2 text-muted-foreground/50 text-sm">
          <span className="h-px w-12 bg-border/40"></span>
          <span>BookLocator</span>
          <span className="h-px w-12 bg-border/40"></span>
        </div>
      </div>
    </div>
  );
}
