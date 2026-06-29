import { cn } from "../../utils/cn.js";

export default function Input({ className, label, ...props }) {
  const control = (
    <input
      className={cn(
        "focus-ring h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );

  if (!label) return control;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {control}
    </label>
  );
}
