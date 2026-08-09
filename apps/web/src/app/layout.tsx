import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Outfit, Poppins, Staatliches } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/components/cart/CartProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ClientShell } from "@/components/ClientShell";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const staatliches = Staatliches({
  subsets: ["latin"],
  variable: "--font-staatliches",
  display: "swap",
  weight: "400",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ginabo | Sentuhan Mewah Setiap Hari",
  description: "Daily Skincare Solution: Brightening, Hydration, Soothing & Barrier Support. Cerah yang tetap nyaman."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${montserrat.variable} ${poppins.variable} ${staatliches.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-poppins" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <ClientShell>
              <SiteHeader />
              <main className="w-full">{children}</main>
              <SiteFooter />
            </ClientShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
