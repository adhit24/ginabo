import type { Metadata } from "next";

import { ResellerTierProvider } from "@/components/reseller/ResellerTierProvider";

export const metadata: Metadata = {
  title: "Ginabo Partner Program | Jualan Skincare, Tumbuh Bareng Ginabo",
  description: "Bergabung sebagai reseller, stockist, atau distributor Ginabo. Sistem sudah siap, produk berkualitas, margin lebar. Cocok untuk pemula sekalipun.",
};

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return <ResellerTierProvider>{children}</ResellerTierProvider>;
}
