// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientWalletProvider } from "@/lib/context/ClientWalletProvider"; // Import Wallet Provider

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
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientWalletProvider> {/* Wrap content with Wallet Provider */}
              {children}
              <Toaster richColors position="top-right" />
           </ClientWalletProvider>
           </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}