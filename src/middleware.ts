import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes except login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('token')?.value;
    const userStr = request.cookies.get('user')?.value;

    if (!token || !userStr) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Decode the URL-encoded cookie value before parsing
      const decodedUserStr = decodeURIComponent(userStr);
      const user = JSON.parse(decodedUserStr);

      if (user.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      console.error('Middleware: Failed to parse user cookie:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
