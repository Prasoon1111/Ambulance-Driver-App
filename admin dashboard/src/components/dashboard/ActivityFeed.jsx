import { formatDateTime } from "../../utils/formatters.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function ActivityFeed({ logs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Realtime Activity</CardTitle>
        <CardDescription>Operational events from dispatch, fleet, hospital, and access systems.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-950">{log.event}</p>
                <StatusBadge status={log.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{log.actor} · {formatDateTime(log.timestamp)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
