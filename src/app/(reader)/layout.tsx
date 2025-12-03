"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Book, ShoppingBag, User, PlusCircle } from "lucide-react";

const sidebarItems = [
  { url: "/my-books", title: "My Books", icon: Book },
  { url: "/list-book", title: "List Book", icon: PlusCircle },
  { url: "/my-transactions", title: "Requests", icon: ShoppingBag },
  { url: "/profile", title: "Profile", icon: User },
];

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AppSidebar items={sidebarItems} title="Reader Portal" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
