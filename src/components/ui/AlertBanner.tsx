import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertBannerProps {
  type?: AlertType;
  title?: string;
  message: string;
  className?: string;
}

const alertStyles: Record<AlertType, string> = {
  success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
  error: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
  warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
  info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function AlertBanner({ type = "info", title, message, className }: AlertBannerProps) {
  const Icon = icons[type];

  return (
    <Alert className={cn(alertStyles[type], className)}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
