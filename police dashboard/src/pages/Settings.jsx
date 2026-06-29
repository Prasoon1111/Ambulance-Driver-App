import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/police/StatusBadge";
import { usePoliceStore } from "@/store/policeStore";

export function Settings() {
  const systemStatus = usePoliceStore((state) => state.systemStatus);

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Configuration</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Settings</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Realtime Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
              <span className="text-sm text-slate-700">Firestore connection</span>
              <StatusBadge value={systemStatus.firestoreConnection} type="system" />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
              <span className="text-sm text-slate-700">GPS sync</span>
              <StatusBadge value={systemStatus.gpsSync} type="system" />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
              <span className="text-sm text-slate-700">Service health</span>
              <StatusBadge value={systemStatus.serviceHealth} type="system" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firebase Integration Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>Environment variables are read from Vite-prefixed Firebase keys.</p>
            <p>Emergency streams can replace mock state through the realtime subscription service.</p>
            <p>Police route protection is isolated in the routing layer for later auth enforcement.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
