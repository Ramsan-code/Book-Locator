"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ShoppingBag, User, PlusCircle, Settings, Heart } from "lucide-react";

const sidebarItems = [
  { url: "/my-books", title: "My Books", icon: BookOpen },
  { url: "/favorites", title: "My Favorites", icon: Heart },
  { url: "/list-book", title: "List Book", icon: PlusCircle },
  { url: "/my-transactions", title: "Requests", icon: ShoppingBag },
  { url: "/profile", title: "Profile", icon: User },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string; // Changed from 'href' to 'title' as a primary identifier in the example
    url: string; // Changed from 'href' to 'url'
    icon: React.ComponentType<{ className?: string }>; // Made icon mandatory based on the example, and kept the type
  }[];
  title?: string;
}

export function AppSidebar({ className, items = sidebarItems, title = "Menu", ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 w-64 border-r bg-muted/40 min-h-screen hidden md:block", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
             <BookOpen className="h-6 w-6 text-primary" />
             <h2 className="text-lg font-semibold tracking-tight">BookLocator</h2>
          </div>
          <div className="px-4 mb-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              {title}
            </h2>
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.url}
                variant={pathname === item.url ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
