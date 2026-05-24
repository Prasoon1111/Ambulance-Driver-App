import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function OperationalStatus({ panels }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Platform infrastructure and third-party feed status.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {panels.map((panel) => (
          <div key={panel.label} className="rounded-md border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-950">{panel.label}</p>
              <StatusBadge status={panel.status} />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-950">{panel.metric}</p>
            <p className="mt-1 text-xs text-slate-500">{panel.helper}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
