"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { CheckSquare, Home, Settings, Users, BookOpen, Search } from "lucide-react";

const sidebarItems = [
  { url: "/admin", title: "Dashboard", icon: Home },
  { url: "/admin/users", title: "Users", icon: Users },
  { url: "/admin/approvals", title: "Reader Approvals", icon: CheckSquare },
  { url: "/admin/books", title: "Book Approvals", icon: BookOpen },
  { url: "/admin/books/search", title: "Search Books", icon: Search },
  { url: "/admin/settings", title: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AppSidebar items={sidebarItems} title="Admin Portal" />
        <main className="flex-1 p-6 bg-gray-50/30">{children}</main>
      </div>
    </div>
  );
}
