import { Ambulance, CalendarClock, Hospital, MapPin, Phone, Route, UserRound, X } from "lucide-react";

import { StatusBadge } from "@/components/police/StatusBadge";
import { Button } from "@/components/ui/button";
import { usePoliceStore } from "@/store/policeStore";
import { cn } from "@/utils/cn";
import { formatCoordinate, formatRelativeTime } from "@/utils/format";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function DetailsDrawer() {
  const open = usePoliceStore((state) => state.drawerOpen);
  const closeDrawer = usePoliceStore((state) => state.closeDrawer);
  const getSelectedEmergency = usePoliceStore((state) => state.getSelectedEmergency);
  const emergency = getSelectedEmergency();

  if (!emergency) return null;

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}>
      <button
        className={cn("absolute inset-0 bg-slate-950/30 transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={closeDrawer}
        aria-label="Close emergency details"
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l bg-white shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950">{emergency.id}</h2>
              <StatusBadge value={emergency.severity} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {emergency.type} emergency · {emergency.status}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={closeDrawer} aria-label="Close drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow icon={UserRound} label="Driver" value={emergency.driverName} />
            <DetailRow icon={Phone} label="Driver phone" value={emergency.driverPhone} />
            <DetailRow icon={Ambulance} label="Ambulance" value={emergency.ambulanceNumber} />
            <DetailRow icon={Hospital} label="Destination hospital" value={emergency.destinationHospital} />
            <DetailRow
              icon={MapPin}
              label="Live coordinates"
              value={`${formatCoordinate(emergency.coordinates.lat)}, ${formatCoordinate(emergency.coordinates.lng)}`}
            />
            <DetailRow icon={CalendarClock} label="Last updated" value={formatRelativeTime(emergency.lastUpdated)} />
          </div>

          <section className="mt-5 rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">Route Information</h3>
            </div>
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-slate-500">Estimated arrival</p>
                  <p className="text-xl font-semibold text-slate-950">{emergency.eta}</p>
                </div>
                <Route className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm leading-6 text-slate-600">{emergency.routeNotes}</p>
              <div className="space-y-3">
                {emergency.route.map((point, index) => (
                  <div key={`${point.lat}-${point.lng}`} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700">
                      {formatCoordinate(point.lat)}, {formatCoordinate(point.lng)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">Timestamps</h3>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <DetailRow icon={CalendarClock} label="Emergency started" value={formatRelativeTime(emergency.startedAt)} />
              <DetailRow icon={CalendarClock} label="Realtime update" value={formatRelativeTime(emergency.lastUpdated)} />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
