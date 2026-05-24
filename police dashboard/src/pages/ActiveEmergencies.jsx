import { DetailsDrawer } from "@/components/emergencies/DetailsDrawer";
import { EmergencyTable } from "@/components/emergencies/EmergencyTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilteredEmergencies } from "@/hooks/useFilteredEmergencies";

export function ActiveEmergencies() {
  const emergencies = useFilteredEmergencies();

  return (
    <>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Emergency operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Active Emergencies</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Emergency Queue</CardTitle>
          <span className="text-xs text-slate-500">{emergencies.length} active records</span>
        </CardHeader>
        <EmergencyTable emergencies={emergencies} />
      </Card>

      <DetailsDrawer />
    </>
  );
}
