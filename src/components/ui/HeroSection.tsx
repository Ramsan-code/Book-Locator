import React from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  children,
  className,
  align = "center",
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-primary text-primary-foreground",
        className
      )}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="container relative z-10 px-4 md:px-6">
        <div
          className={cn(
            "flex flex-col gap-4 max-w-3xl mx-auto",
            align === "center" && "text-center items-center",
            align === "left" && "text-left items-start",
            align === "right" && "text-right items-end"
          )}
        >
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-primary-foreground/80 md:text-xl">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}
