import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function AmbulanceMonitoring({ ambulances }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ambulance Monitoring</CardTitle>
        <CardDescription>Fleet availability, GPS connectivity, and assignment coverage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ambulances.slice(0, 5).map((unit) => (
          <div key={unit.id} className="flex items-center justify-between gap-4 rounded-md border border-slate-100 px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-950">{unit.id} · {unit.type}</p>
              <p className="truncate text-xs text-slate-500">{unit.hospital} · {unit.lastPing}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={unit.gps} />
              <StatusBadge status={unit.status} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
