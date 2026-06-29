import { cn } from "../../utils/cn.js";

const styles = {
  Operational: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "On Call": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Online: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Critical: "bg-red-50 text-red-700 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-orange-600/20",
  "High Load": "bg-orange-50 text-orange-700 ring-orange-600/20",
  Warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Degraded: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Limited Intake": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Medium: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Dispatching: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "En Route": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Dispatched: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Standby: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Break: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Maintenance: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Offline: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Pending: "bg-yellow-50 text-yellow-800 ring-yellow-600/25",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Rejected: "bg-red-50 text-red-700 ring-red-600/20",
  "Resubmission Required": "bg-orange-50 text-orange-700 ring-orange-600/20",
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status] || "bg-slate-100 text-slate-700 ring-slate-500/20",
        className,
      )}
    >
      {status}
    </span>
  );
}
