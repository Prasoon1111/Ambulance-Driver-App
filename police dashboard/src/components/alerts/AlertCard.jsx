import { AlertTriangle, Clock } from "lucide-react";

import { StatusBadge } from "@/components/police/StatusBadge";
import { formatRelativeTime } from "@/utils/format";

export function AlertCard({ alert }) {
  return (
    <article className="rounded-lg border bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-status-critical">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-950">{alert.title}</p>
            <StatusBadge value={alert.severity} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{alert.category}</p>
          <p className="mt-2 text-sm leading-5 text-slate-600">{alert.description}</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeTime(alert.timestamp)}
          </p>
        </div>
      </div>
    </article>
  );
}
