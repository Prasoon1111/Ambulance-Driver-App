import { cn } from "@/utils/cn";

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("border-b bg-slate-50 text-xs uppercase text-slate-500", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn("transition-colors hover:bg-slate-50", className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={cn("h-10 px-3 text-left font-semibold", className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={cn("px-3 py-3 align-middle text-slate-700", className)} {...props} />;
}
