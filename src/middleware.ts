import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for auth token in cookies
    const token = request.cookies.get('token')?.value;
    const userStr = request.cookies.get('user')?.value;

    if (!token || !userStr) {
      // No token, redirect to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Parse user data
      const user = JSON.parse(userStr);

      // Check if user is admin
      if (user.role !== 'admin') {
        // Not an admin, redirect to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      // Invalid user data, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
