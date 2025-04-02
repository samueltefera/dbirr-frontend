// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "@/components/ui/sonner"; // Correct import path for sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dbirr",
  description: "Solana Payment Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" /> {/* Render sonner's Toaster, optionally configure */}
        </AuthProvider>
      </body>
    </html>
  );
}