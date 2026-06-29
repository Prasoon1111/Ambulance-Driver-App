import { DetailsDrawer } from "@/components/emergencies/DetailsDrawer";
import { EmergencyCard } from "@/components/emergencies/EmergencyCard";
import { MapContainer } from "@/components/maps/MapContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilteredEmergencies } from "@/hooks/useFilteredEmergencies";
import { usePoliceStore } from "@/store/policeStore";

export function LiveTracking() {
  const emergencies = useFilteredEmergencies();
  const hospitals = usePoliceStore((state) => state.hospitals);

  return (
    <>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Realtime route visibility</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Live Tracking</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <MapContainer emergencies={emergencies} hospitals={hospitals} />
        <Card>
          <CardHeader>
            <CardTitle>Units On Map</CardTitle>
            <span className="text-xs text-slate-500">{emergencies.length} routes</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencies.map((emergency) => (
              <EmergencyCard key={emergency.id} emergency={emergency} />
            ))}
          </CardContent>
        </Card>
      </div>

      <DetailsDrawer />
    </>
  );
}
