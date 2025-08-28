import "./globals.css";
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "@/app/providers";
import AuthProvider from "@/components/AuthProvider";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Tamil Spice Bazaar",
  description: "Authentic Tamil Nadu spices with animated, modern shopping experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} font-body min-h-screen bg-cream bg-spice-gradient`}>        
        <AuthProvider>
          <Providers>
            <Navbar />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
