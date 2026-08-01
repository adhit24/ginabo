"use client";

import { RETURN_STATUS_LABELS, type ReturnStatus } from "@/types/returns";

const TONE: Record<ReturnStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-700",
  more_evidence_required: "bg-orange-50 text-orange-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  awaiting_shipment: "bg-indigo-50 text-indigo-700",
  item_received: "bg-cyan-50 text-cyan-700",
  quality_inspection: "bg-violet-50 text-violet-700",
  refund_approved: "bg-teal-50 text-teal-700",
  exchange_approved: "bg-teal-50 text-teal-700",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
  escalated: "bg-rose-50 text-rose-700",
};

export function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        TONE[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {RETURN_STATUS_LABELS[status] ?? status}
    </span>
  );
}
