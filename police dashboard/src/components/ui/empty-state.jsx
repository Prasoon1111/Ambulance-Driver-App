import { SearchX } from "lucide-react";

export function EmptyState({ title = "No records found", description = "Try adjusting the search or filters." }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-slate-50 px-4 text-center">
      <SearchX className="h-5 w-5 text-slate-400" />
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="max-w-sm text-xs text-slate-500">{description}</p>
    </div>
  );
}
