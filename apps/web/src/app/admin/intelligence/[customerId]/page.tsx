"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Customer360Data } from "@/features/command-center/types";
import { getDemoCustomer360 } from "@/features/command-center/demo-v2";
import { Customer360Panel } from "@/components/admin/customer-intelligence/Customer360Panel";

export default function Customer360Page() {
  const params = useParams();
  const customerId = typeof params.customerId === "string" ? params.customerId : "cst-1";
  const [data, setData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoCustomer360(customerId).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [customerId]);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-white/10 bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/intelligence" className="text-xs text-white/30 hover:text-white/60">
          ← Customer Intelligence
        </Link>
        {data.source === "demo" && (
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">DATA DEMO</span>
        )}
      </header>
      <Customer360Panel data={data} />
    </div>
  );
}
