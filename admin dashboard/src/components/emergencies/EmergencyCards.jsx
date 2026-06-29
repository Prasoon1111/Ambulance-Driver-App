import { Clock3, MapPin } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function EmergencyCards({ rows }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {rows.map((item) => (
        <Card key={item.id}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-950">{item.id}</h2>
                  <StatusBadge status={item.severity} />
                </div>
                <p className="mt-1 text-sm text-slate-500">Patient reference {item.patientRef}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" />{item.region}</div>
              <div className="flex items-center gap-2 text-slate-600"><Clock3 className="h-4 w-4 text-slate-400" />ETA {item.eta}</div>
              <div><p className="text-xs text-slate-500">Ambulance</p><p className="font-medium text-slate-950">{item.ambulance}</p></div>
              <div><p className="text-xs text-slate-500">Destination</p><p className="font-medium text-slate-950">{item.hospital}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
