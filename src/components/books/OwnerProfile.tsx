"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface OwnerProfileProps {
  owner: {
    _id: string;
    name: string;
    email?: string;
    location?: {
      coordinates: [number, number];
    };
  };
  averageRating?: number;
  reviewCount?: number;
  className?: string;
}

export function OwnerProfile({
  owner,
  averageRating = 0,
  reviewCount = 0,
  className,
}: OwnerProfileProps) {
  const router = useRouter();
  const { token } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={undefined} alt={owner.name} />
            <AvatarFallback>
              {getInitials(owner.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Owner
            </div>
            <h3 className="font-bold text-lg leading-none">
              {owner.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
              <span>({reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        
        {token ? (
          <Button
            variant="outline"
            onClick={() => router.push(`/profile/${owner._id}`)}
          >
            View Profile
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/auth/login">View Profile</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
