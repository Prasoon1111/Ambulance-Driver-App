import { Ambulance, Building2, Crosshair, Flame, Navigation, Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePoliceStore } from "@/store/policeStore";
import { cn } from "@/utils/cn";

function projectPoint({ lat, lng }) {
  const minLat = 28.59;
  const maxLat = 28.65;
  const minLng = 77.19;
  const maxLng = 77.23;
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: 100 - ((lat - minLat) / (maxLat - minLat)) * 100,
  };
}

function RoutePath({ route, active }) {
  const points = route.map(projectPoint);
  const path = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <polyline
      points={path}
      fill="none"
      stroke={active ? "#175cd3" : "#64748b"}
      strokeWidth={active ? "1.35" : "0.85"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={active ? "0" : "2 2"}
      opacity={active ? "0.95" : "0.5"}
    />
  );
}

export function MapContainer({ emergencies, hospitals }) {
  const selectedEmergencyId = usePoliceStore((state) => state.selectedEmergencyId);
  const selectEmergency = usePoliceStore((state) => state.selectEmergency);
  const activeEmergency = emergencies.find((emergency) => emergency.id === selectedEmergencyId) ?? emergencies[0];

  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-lg border bg-[#edf3f4] shadow-map">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.20)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.20)_1px,transparent_1px)] bg-[size:58px_58px]" />
        <div className="absolute left-[8%] top-[18%] h-[68%] w-[84%] rounded-[48%] border border-slate-300/60" />
        <div className="absolute left-[16%] top-[28%] h-[42%] w-[68%] rotate-[-8deg] rounded-[42%] border border-slate-300/70" />
        <div className="absolute left-0 top-[45%] h-3 w-full -rotate-6 bg-white/80 shadow-sm" />
        <div className="absolute left-[45%] top-0 h-full w-3 rotate-12 bg-white/80 shadow-sm" />
        <div className="absolute left-[21%] top-0 h-full w-2 -rotate-12 bg-white/70" />
        <div className="absolute left-0 top-[68%] h-2 w-full rotate-2 bg-white/70" />
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {emergencies.map((emergency) => (
          <RoutePath key={emergency.id} route={emergency.route} active={emergency.id === activeEmergency?.id} />
        ))}
      </svg>

      <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
        <Badge variant="success">Live map</Badge>
        <Badge variant="neutral">{emergencies.length} active routes</Badge>
        <Badge variant="neutral">Delhi central zone</Badge>
      </div>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Button variant="secondary" size="sm">
          <Crosshair className="h-4 w-4" />
          Center
        </Button>
        <Button variant="secondary" size="sm">
          <Route className="h-4 w-4" />
          Routes
        </Button>
      </div>

      {hospitals.map((hospital) => {
        const point = projectPoint(hospital);
        return (
          <div
            key={hospital.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-700 shadow-panel">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="mt-1 hidden rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-panel md:block">
              {hospital.name}
            </div>
          </div>
        );
      })}

      {emergencies.map((emergency) => {
        const point = projectPoint(emergency.coordinates);
        const isActive = emergency.id === activeEmergency?.id;
        return (
          <button
            key={emergency.id}
            className={cn("absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left", isActive && "z-30")}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onClick={() => selectEmergency(emergency.id)}
          >
            <span
              className={cn(
                "absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10",
                emergency.severity === "Critical" && "bg-red-500/10",
                isActive && "h-16 w-16",
              )}
            />
            <span
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-map",
                emergency.severity === "Critical" && "bg-status-critical",
              )}
            >
              <Ambulance className="h-5 w-5" />
            </span>
            {isActive && (
              <span className="absolute left-10 top-0 w-44 rounded-lg border bg-white p-2 shadow-panel">
                <span className="block text-xs font-semibold text-slate-950">{emergency.id}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <Navigation className="h-3 w-3" />
                  ETA {emergency.eta} · {emergency.status}
                </span>
              </span>
            )}
          </button>
        );
      })}

      {emergencies
        .filter((emergency) => emergency.severity === "Critical" || emergency.severity === "High")
        .map((emergency) => {
          const point = projectPoint(emergency.pickup);
          return (
            <div
              key={`${emergency.id}-hotspot`}
              className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-200 bg-red-50 text-status-critical"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <Flame className="h-4 w-4" />
            </div>
          );
        })}

      <div className="absolute bottom-4 left-4 right-4 z-10 grid gap-2 rounded-lg border bg-white/95 p-3 shadow-panel sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Active route</p>
          <p className="truncate text-sm font-semibold text-slate-950">{activeEmergency?.id} · {activeEmergency?.type}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Destination</p>
          <p className="truncate text-sm font-semibold text-slate-950">{activeEmergency?.destinationHospital}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Traffic coordination</p>
          <p className="truncate text-sm font-semibold text-slate-950">{activeEmergency?.routeNotes}</p>
        </div>
      </div>
    </section>
  );
}
