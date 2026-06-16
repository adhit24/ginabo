import "./globals.css";

import type { Metadata } from "next";
import { Fraunces, Montserrat, Outfit, Poppins, Staatliches } from "next/font/google";

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

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ginabo — Sentuhan Mewah Setiap Hari",
  description: "Daily Skincare Solution: Brightening, Hydration, Soothing & Barrier Support. Cerah yang tetap nyaman.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${montserrat.variable} ${poppins.variable} ${staatliches.variable} ${outfit.variable} ${fraunces.variable}`}>
      <body className="font-poppins">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-dvh bg-[#fffafa]">
              <SiteHeader />
              <main className="w-full">{children}</main>
              <SiteFooter />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
