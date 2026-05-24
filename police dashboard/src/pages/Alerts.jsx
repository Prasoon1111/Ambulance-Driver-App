import { AlertCard } from "@/components/alerts/AlertCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoliceStore } from "@/store/policeStore";

export function Alerts() {
  const priorityAlerts = usePoliceStore((state) => state.priorityAlerts);

  return (
    <>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority coordination</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Priority Alerts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Alert Queue</CardTitle>
          <span className="text-xs text-slate-500">Cardiac, trauma, stroke, accident, and critical response</span>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {priorityAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
