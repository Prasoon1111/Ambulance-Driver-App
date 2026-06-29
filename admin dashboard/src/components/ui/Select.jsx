import { cn } from "../../utils/cn.js";

export default function Select({ className, label, options = [], ...props }) {
  const control = (
    <select
      className={cn(
        "focus-ring h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900",
        className,
      )}
      {...props}
  >
      {options.map((option) => (
        <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
          {typeof option === "string" ? option : option.label}
        </option>
      ))}
    </select>
  );

  if (!label) return control;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {control}
    </label>
  );
}
