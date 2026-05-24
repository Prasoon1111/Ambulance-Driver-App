import { Ambulance, DatabaseZap, RadioTower, Server, Wifi } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/police/StatusBadge";
import { formatRelativeTime } from "@/utils/format";

const statusItems = [
  { key: "gpsSync", label: "GPS sync", icon: RadioTower },
  { key: "firestoreConnection", label: "Firestore", icon: DatabaseZap },
  { key: "activeAmbulances", label: "Active ambulances", icon: Ambulance },
  { key: "onlineUnits", label: "Online units", icon: Wifi },
  { key: "serviceHealth", label: "Service health", icon: Server },
];

export function SystemStatus({ status }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <span className="text-xs text-slate-500">Heartbeat {formatRelativeTime(status.lastHeartbeat)}</span>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statusItems.map((item) => {
          const Icon = item.icon;
          const value = status[item.key];
          return (
            <div key={item.key} className="rounded-lg border bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                {typeof value === "string" ? <StatusBadge value={value} type="system" /> : null}
              </div>
              <p className="mt-3 text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
