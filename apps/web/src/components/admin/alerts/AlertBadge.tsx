import type { AlertSeverity } from "@/features/command-center/types";

const BADGE_STYLE: Record<AlertSeverity, string> = {
  critical: "bg-rose-500 text-white",
  high: "bg-amber-500 text-black",
  medium: "bg-yellow-400 text-black",
  low: "bg-blue-500 text-white",
};

const BADGE_LABEL: Record<AlertSeverity, string> = {
  critical: "Kritikal",
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

export function AlertBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${BADGE_STYLE[severity]}`}>
      {BADGE_LABEL[severity]}
    </span>
  );
}
