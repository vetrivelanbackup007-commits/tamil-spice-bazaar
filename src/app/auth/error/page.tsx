"use client"

import Link from "next/link"
import Button from "@/components/ui/Button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function AuthErrorPageContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error") || null

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in."
      case "Verification":
        return "The verification token has expired or has already been used."
      default:
        return "An error occurred during authentication."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="section">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="card p-8 text-center">
              <div className="text-6xl mb-6">⚠️</div>
              <h1 className="mb-4">Authentication Error</h1>
              <p className="text-gray-600 mb-8">
                {getErrorMessage(error)}
              </p>
              
              <div className="space-y-4">
                <Link href="/auth/signin">
                  <Button size="large" className="w-full">
                    Try Again
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="secondary" size="large" className="w-full">
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorPageContent />
    </Suspense>
  )
}
