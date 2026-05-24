import { cva } from "class-variance-authority";

import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        critical: "border-red-200 bg-red-50 text-status-critical",
        high: "border-amber-200 bg-amber-50 text-status-high",
        medium: "border-blue-200 bg-blue-50 text-status-medium",
        low: "border-emerald-200 bg-emerald-50 text-status-low",
        neutral: "border-slate-200 bg-slate-50 text-slate-600",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
