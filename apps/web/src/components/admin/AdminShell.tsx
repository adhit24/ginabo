"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/slots", label: "Slots" },
  { href: "/admin/customers", label: "Customers" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-900">Admin Dashboard</div>
        <form action="/api/admin/auth/logout" method="post">
          <button type="submit" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900">
            Logout
          </button>
        </form>
      </div>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2">
        {items.map((i) => {
          const active = pathname === i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={[
                "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold",
                active ? "bg-brand-100 text-brand-800" : "text-gray-700 hover:bg-gray-50"
              ].join(" ")}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}

