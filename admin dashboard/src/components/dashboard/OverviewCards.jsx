import { Ambulance, CheckCircle2, ClipboardCheck, OctagonX, UserCheck } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";

const icons = [UserCheck, Ambulance, ClipboardCheck, CheckCircle2, OctagonX];

export default function OverviewCards({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat, index) => {
        const Icon = icons[index] || ClipboardCheck;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{stat.value}</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">{stat.detail}</span>
                <span className={stat.tone === "warning" ? "font-medium text-amber-700" : stat.tone === "danger" ? "font-medium text-red-600" : "font-medium text-emerald-700"}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
