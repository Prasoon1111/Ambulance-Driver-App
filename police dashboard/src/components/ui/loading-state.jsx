import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading realtime data" }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
