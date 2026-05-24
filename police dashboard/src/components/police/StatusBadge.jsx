import { Badge } from "@/components/ui/badge";

const variantBySeverity = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
};

export function StatusBadge({ value, type = "severity" }) {
  if (type === "severity") {
    return <Badge variant={variantBySeverity[value] ?? "neutral"}>{value}</Badge>;
  }

  if (value === "Connected" || value === "Synced" || value === "Operational") {
    return <Badge variant="success">{value}</Badge>;
  }

  return <Badge variant="neutral">{value}</Badge>;
}
