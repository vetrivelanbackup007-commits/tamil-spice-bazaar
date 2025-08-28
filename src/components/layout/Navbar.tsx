"use client"

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";

function UserMenu() {
  const { data: session, status } = useSession();

  // Debug logging
  console.log('UserMenu Debug:', { 
    status, 
    hasSession: !!session, 
    userRole: session?.user?.role,
    userEmail: session?.user?.email 
  });

  if (status === "loading") {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth/signin">
          <Button size="small">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">Hi, {session.user?.name}</span>
      {session.user?.role === "ADMIN" && (
        <Link href="/admin">
          <Button size="small" variant="secondary">Admin</Button>
        </Link>
      )}
      <Button 
        size="small" 
        variant="secondary" 
        onClick={() => signOut()}
      >
        Sign Out
      </Button>
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black hover:text-gray-700 transition-colors">
          Tamil Spice Bazaar
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
            Home
          </Link>
          <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
            Products
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
            About
          </Link>
          <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
            Cart
          </Link>
        </nav>
        <UserMenu />
        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-gray-700 hover:text-black">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
