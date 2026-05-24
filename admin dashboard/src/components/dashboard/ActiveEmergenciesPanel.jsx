import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function ActiveEmergenciesPanel({ emergencies }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Active Emergencies</CardTitle>
          <CardDescription>Live dispatch queue across connected regions.</CardDescription>
        </div>
        <Link to="/admin/emergencies" className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950">
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {emergencies.slice(0, 4).map((item) => (
            <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-950">{item.id}</p>
                  <StatusBadge status={item.severity} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.region} to {item.hospital}</p>
              </div>
              <StatusBadge status={item.status} />
              <div className="text-left md:text-right">
                <p className="text-sm font-semibold text-slate-950">{item.eta}</p>
                <p className="text-xs text-slate-500">ETA</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
