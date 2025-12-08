"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoginModal } from "@/components/auth/LoginModal";
import { BookOpen, User, LogOut, LayoutDashboard, ShoppingBag, List, Library, Package, Heart } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Book Locator
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/books"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Browse Books
              </Link>
              {user?.role === 'user' && (
                <>
                  <Link
                    href="/my-books"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    My Books
                  </Link>
                  <Link
                    href="/favorites"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    My Favorites
                  </Link>
                  <Link
                    href="/my-transactions"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Requests
                  </Link>
                  <Link
                    href="/profile"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Profile
                  </Link>
                </>
              )}
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center space-x-2">
            {user && user.role !== 'admin' && (
              <Button variant="outline" size="sm" className="mr-2" asChild>
                <Link href="/list-book">
                  List a Book
                </Link>
              </Button>
            )}
            {user ? (
              <div suppressHydrationWarning>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 rounded-full pl-2 pr-3 gap-2"
                    suppressHydrationWarning
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block text-sm font-medium">{user.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="hidden md:inline-block"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'user' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-books">
                          <Package className="mr-2 h-4 w-4" />
                          <span>My Listings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-transactions">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>My Transactions</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>My Favorites</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : (
              <>
                <LoginModal id="navbar-login-modal">
                  <Button variant="ghost" size="sm" suppressHydrationWarning>
                    Sign In
                  </Button>
                </LoginModal>
                <Button size="sm" asChild>
                  <Link href="/auth/register">
                    Register
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
