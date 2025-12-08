import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "destructive"
  | "muted"
  | "default";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, StatusType> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  active: "success",
  inactive: "muted",
  success: "success",
  error: "destructive",
  warning: "warning",
  info: "info",
};

const statusStyles: Record<StatusType, string> = {
  pending: "bg-warning text-warning-foreground hover:bg-warning/80",
  approved: "bg-success text-success-foreground hover:bg-success/80",
  rejected: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  active: "bg-success text-success-foreground hover:bg-success/80",
  inactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  success: "bg-success text-success-foreground hover:bg-success/80",
  error: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  warning: "bg-warning text-warning-foreground hover:bg-warning/80",
  info: "bg-info text-info-foreground hover:bg-info/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  muted: "bg-muted text-muted-foreground hover:bg-muted/80",
  default: "bg-primary text-primary-foreground hover:bg-primary/80",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const type = statusMap[normalizedStatus] || "default";
  
  // If the status is not mapped but is one of the keys in statusStyles, use it directly
  const styleKey = (statusStyles[normalizedStatus as StatusType] ? normalizedStatus : type) as StatusType;

  return (
    <Badge className={cn(statusStyles[styleKey], "capitalize", className)}>
      {status}
    </Badge>
  );
}
