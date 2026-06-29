import { cn } from "../../utils/cn.js";

const labels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  resubmission_required: "Resubmission Required",
};

const styles = {
  pending: "bg-yellow-50 text-yellow-800 ring-yellow-600/25",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  resubmission_required: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

export default function VerificationStatusBadge({ status = "pending", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status] || styles.pending,
        className,
      )}
    >
      {labels[status] || status}
    </span>
  );
}

export function formatVerificationStatus(status) {
  return labels[status] || status;
}
