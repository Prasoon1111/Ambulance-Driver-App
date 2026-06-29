import { Check, Eye, FileSearch, RotateCcw, X } from "lucide-react";
import { formatDateTime } from "../../utils/formatters.js";
import Button from "../ui/Button.jsx";
import DataTable from "../ui/DataTable.jsx";
import VerificationStatusBadge from "../ui/VerificationStatusBadge.jsx";

export default function DriversTable({
  rows,
  onApprove,
  onReject,
  onRequestResubmission,
  onViewDetails,
  onViewDocuments,
}) {
  return (
    <DataTable
      rows={rows}
      emptyTitle="No drivers match this view"
      columns={[
        { key: "fullName", header: "Driver Name", render: (row) => <div><p className="font-medium text-slate-950">{row.fullName}</p><p className="text-xs text-slate-500">{row.id}</p></div> },
        { key: "hospitalName", header: "Hospital" },
        { key: "phone", header: "Phone" },
        { key: "aadhaarStatus", header: "Aadhaar Status", render: (row) => <VerificationStatusBadge status={row.aadhaarStatus} /> },
        { key: "licenceStatus", header: "Licence Status", render: (row) => <VerificationStatusBadge status={row.licenceStatus} /> },
        { key: "verificationStatus", header: "Verification Status", render: (row) => <VerificationStatusBadge status={row.verificationStatus} /> },
        { key: "submittedAt", header: "Submitted Date", render: (row) => formatDateTime(row.submittedAt) },
        {
          key: "actions",
          header: "",
          render: (row) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => onViewDetails(row)} aria-label={`View ${row.fullName}`}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onViewDocuments(row)} aria-label={`View documents for ${row.fullName}`}>
                <FileSearch className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onApprove(row)} aria-label={`Approve ${row.fullName}`} disabled={row.verificationStatus === "approved"}>
                <Check className="h-4 w-4 text-emerald-700" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onReject(row)} aria-label={`Reject ${row.fullName}`} disabled={row.verificationStatus === "rejected"}>
                <X className="h-4 w-4 text-red-700" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onRequestResubmission(row)} aria-label={`Request resubmission for ${row.fullName}`} disabled={row.verificationStatus === "resubmission_required"}>
                <RotateCcw className="h-4 w-4 text-orange-700" />
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
