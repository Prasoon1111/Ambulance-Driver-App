import { Ambulance, Clock, Hospital, MapPin } from "lucide-react";

import { StatusBadge } from "@/components/police/StatusBadge";
import { usePoliceStore } from "@/store/policeStore";
import { formatRelativeTime } from "@/utils/format";

export function EmergencyCard({ emergency }) {
  const selectEmergency = usePoliceStore((state) => state.selectEmergency);

  return (
    <button
      className="w-full rounded-lg border bg-white p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
      onClick={() => selectEmergency(emergency.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{emergency.id}</p>
          <p className="mt-1 text-xs text-slate-500">{emergency.type}</p>
        </div>
        <StatusBadge value={emergency.severity} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <Ambulance className="h-3.5 w-3.5" />
          {emergency.ambulanceNumber}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          ETA {emergency.eta}
        </span>
        <span className="col-span-2 flex items-center gap-1.5">
          <Hospital className="h-3.5 w-3.5" />
          {emergency.destinationHospital}
        </span>
        <span className="col-span-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {emergency.status} · {formatRelativeTime(emergency.lastUpdated)}
        </span>
      </div>
    </button>
  );
}
