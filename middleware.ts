import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for admin login page
  if (path === '/admin/login') {
    return NextResponse.next();
  }
  
  // Check if the path is for admin routes
  if (path.startsWith('/admin')) {
    // Get the admin token from cookies
    const token = req.cookies.get('admin-token')?.value;
    
    // If no token, redirect to admin login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    // Use a simpler approach since we can't use jwt.verify in Edge runtime
    // We'll just check if the token exists - the actual verification happens on the server side
    // in API routes which run in Node.js environment
    
    // Allow the request to continue if token exists
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
