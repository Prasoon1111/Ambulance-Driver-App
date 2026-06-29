import { cn } from "@/utils/cn";

export function Card({ className, ...props }) {
  return <div className={cn("ops-panel", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex items-start justify-between gap-3 border-b px-4 py-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-sm font-semibold text-slate-900", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}
