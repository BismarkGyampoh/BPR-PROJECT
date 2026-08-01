import { clsx } from "clsx";

export function StatusBadge({ status, tone }: { status: string; tone?: "success" | "warning" | "danger" | "neutral" }) {
  const inferredTone = tone ?? (status === "DELIVERED" || status === "SUCCESS" || status === "COMPLETED" || status === "ACTIVE" ? "success" : status === "FAILED" || status === "CANCELED" || status === "C_REJECT" ? "danger" : status === "PENDING" || status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY" ? "warning" : "neutral");
  return <span className={clsx("status-pill", inferredTone === "success" && "bg-emerald-100 text-emerald-800", inferredTone === "warning" && "bg-amber-100 text-amber-800", inferredTone === "danger" && "bg-red-100 text-red-800", inferredTone === "neutral" && "bg-surface-muted text-muted")}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{status.replaceAll("_", " ")}</span>;
}
