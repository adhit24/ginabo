import "./globals.css";

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/components/cart/CartProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ginabo — Sentuhan Mewah Setiap Hari",
  description: "Daily Skincare Solution: Brightening, Hydration, Soothing & Barrier Support. Cerah yang tetap nyaman."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={montserrat.variable}>
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-dvh bg-brand-50">
              <SiteHeader />
              <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(2.5rem+var(--safe-bottom))] pt-6 md:px-6 md:pb-10 md:pt-10">{children}</main>
              <SiteFooter />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
