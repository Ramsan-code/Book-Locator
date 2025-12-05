"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingDisplay } from "./RatingDisplay";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    comment: string;
    reviewer?: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  };
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({ review, currentUserId, onDelete }: ReviewCardProps) {
  const reviewerName = review.reviewer?.name || "Anonymous";
  const reviewerId = review.reviewer?._id || "";
  const isOwnReview = currentUserId && reviewerId && currentUserId === reviewerId;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reviewerName}`} />
            <AvatarFallback>{reviewerName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{reviewerName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <RatingDisplay rating={review.rating} size="sm" />
                  <Badge variant="secondary" className="text-xs">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </Badge>
                </div>
              </div>
              
              {isOwnReview && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(review._id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
