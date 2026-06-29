import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";

const colors = {
  Approved: "#059669",
  Rejected: "#dc2626",
  Pending: "#ca8a04",
  Resubmission: "#ea580c",
};

export default function VerificationCharts({ trend, breakdown }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Verification Trends</CardTitle>
          <CardDescription>Approval and rejection trends across submitted verification requests.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="approvals" name="Approvals" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejections" name="Rejections" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval vs Rejection Rate</CardTitle>
          <CardDescription>Current verification queue distribution.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {breakdown.map((entry) => (
                  <Cell key={entry.name} fill={colors[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-[-18px] grid grid-cols-2 gap-2 text-xs text-slate-600">
            {breakdown.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[entry.name] || "#94a3b8" }} />
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
