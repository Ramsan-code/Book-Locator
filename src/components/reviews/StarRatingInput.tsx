"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  maxRating = 5,
  size = "md",
  className,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = React.useState(0);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverValue || value);

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-warning text-warning"
                  : "fill-none text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
