import { Ambulance, CheckCircle2, MapPinned, Radio, Route, TriangleAlert } from "lucide-react";

import { formatRelativeTime } from "@/utils/format";

const iconByType = {
  "emergency-started": Radio,
  "ambulance-moving": Ambulance,
  "emergency-completed": CheckCircle2,
  "gps-disconnected": MapPinned,
  "route-updated": Route,
  "emergency-escalated": TriangleAlert,
};

export function ActivityItem({ item }) {
  const Icon = iconByType[item.type] ?? Radio;

  return (
    <div className="flex gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{item.title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-600">{item.detail}</p>
        <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(item.timestamp)}</p>
      </div>
    </div>
  );
}
