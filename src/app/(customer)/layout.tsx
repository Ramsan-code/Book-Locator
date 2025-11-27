"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Home, Search, ShoppingBag, User } from "lucide-react";

const sidebarItems = [
  { url: "/customer", title: "Dashboard", icon: Home },
  { url: "/customer/search", title: "Search Books", icon: Search },
  { url: "/customer/orders", title: "My Orders", icon: ShoppingBag },
  { url: "/customer/profile", title: "Profile", icon: User },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AppSidebar items={sidebarItems} title="Customer" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
