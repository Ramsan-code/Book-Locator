"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Listings",
    href: "/books",
    icon: BookOpen,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <React.Fragment key={item.href}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 flex-1",
                  active && "text-primary bg-primary/10"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-primary/20")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
              {index < navItems.length - 1 && (
                <Separator orientation="vertical" className="h-8" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
