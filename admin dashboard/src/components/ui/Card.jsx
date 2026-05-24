import { cn } from "../../utils/cn.js";

export function Card({ className, ...props }) {
  return (
    <section
      className={cn("rounded-lg border border-slate-200 bg-white shadow-soft", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("border-b border-slate-100 px-5 py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-sm font-semibold text-slate-950", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("mt-1 text-sm text-slate-500", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}
