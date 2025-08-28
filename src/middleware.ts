import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Skip middleware for admin login page to prevent redirect loop
    if (req.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Protect other admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow access to admin login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        
        // For other admin routes, require ADMIN role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // For other routes, allow access
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}
