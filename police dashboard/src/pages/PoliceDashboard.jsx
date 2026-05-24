import { AlertCard } from "@/components/alerts/AlertCard";
import { ActivityItem } from "@/components/activity/ActivityItem";
import { EmergencyCard } from "@/components/emergencies/EmergencyCard";
import { DetailsDrawer } from "@/components/emergencies/DetailsDrawer";
import { MapContainer } from "@/components/maps/MapContainer";
import { SystemStatus } from "@/components/police/SystemStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilteredEmergencies } from "@/hooks/useFilteredEmergencies";
import { usePoliceStore } from "@/store/policeStore";

export function PoliceDashboard() {
  const emergencies = useFilteredEmergencies();
  const hospitals = usePoliceStore((state) => state.hospitals);
  const priorityAlerts = usePoliceStore((state) => state.priorityAlerts);
  const activityFeed = usePoliceStore((state) => state.activityFeed);
  const systemStatus = usePoliceStore((state) => state.systemStatus);

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Police monitoring dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Live ambulance coordination</h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Real-time emergency route visibility, traffic awareness, and ambulance movement monitoring for police coordination teams.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <MapContainer emergencies={emergencies} hospitals={hospitals} />
          <SystemStatus status={systemStatus} />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Emergencies</CardTitle>
              <span className="text-xs text-slate-500">{emergencies.length} live</span>
            </CardHeader>
            <CardContent className="max-h-[440px] space-y-3 overflow-y-auto scrollbar-thin">
              {emergencies.map((emergency) => (
                <EmergencyCard key={emergency.id} emergency={emergency} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Alerts</CardTitle>
              <span className="text-xs text-slate-500">Subtle escalation queue</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityAlerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Operational Activity Feed</CardTitle>
            <span className="text-xs text-slate-500">Realtime events</span>
          </CardHeader>
          <div className="grid md:grid-cols-2 xl:grid-cols-3">
            {activityFeed.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </Card>
      </div>

      <DetailsDrawer />
    </>
  );
}
