import "./globals.css";

import type { Metadata } from "next";
import { Montserrat, Outfit, Plus_Jakarta_Sans, Poppins, Staatliches } from "next/font/google";

import Script from "next/script";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/components/cart/CartProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { ClientShell } from "@/components/ClientShell";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

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

export const metadata: Metadata = {
  title: "Ginabo | Sentuhan Mewah Setiap Hari",
  description: "Daily Skincare Solution: Brightening, Hydration, Soothing & Barrier Support. Cerah yang tetap nyaman.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ginabo.id"),
  openGraph: {
    title: "Ginabo | Sentuhan Mewah Setiap Hari",
    description: "Daily Skincare Solution: Brightening, Hydration, Soothing & Barrier Support. Cerah yang tetap nyaman.",
    url: "/",
    siteName: "Ginabo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ginabo Skincare",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ginabo | Sentuhan Mewah Setiap Hari",
    description: "Daily Skincare Solution: Brightening, Hydration, Soothing & Barrier Support. Cerah yang tetap nyaman.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const CustomScript = Script as any;

  return (
    <html
      lang="id"
      className={`${outfit.variable} ${plusJakartaSans.variable} ${montserrat.variable} ${poppins.variable} ${staatliches.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased text-[#292929] bg-[#FFFFFF]" suppressHydrationWarning>
        {gtmId && (
          <>
            <CustomScript
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <ClientShell>
                <SiteHeader />
                <main className="w-full">{children}</main>
                <SiteFooter />
              </ClientShell>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
        <WhatsAppWidget />
      </body>
    </html>
  );
}
