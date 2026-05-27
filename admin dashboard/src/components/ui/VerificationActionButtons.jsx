import { AlertCircle, ShieldCheck, XCircle } from "lucide-react";
import Button from "./Button.jsx";

export default function VerificationActionButtons({
  record,
  onVerify,
  onReject,
  onRequestResubmission,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap justify-end gap-2 ${className}`}>
      <Button
        className="bg-emerald-600 hover:bg-emerald-700"
        onClick={() => onVerify(record)}
        disabled={record?.verificationStatus === "approved"}
      >
        <ShieldCheck className="h-4 w-4" />
        Verify
      </Button>
      <Button
        variant="danger"
        onClick={() => onReject(record)}
        disabled={record?.verificationStatus === "rejected"}
      >
        <XCircle className="h-4 w-4" />
        Reject
      </Button>
      <Button
        className="bg-orange-600 text-white hover:bg-orange-700"
        onClick={() => onRequestResubmission(record)}
        disabled={record?.verificationStatus === "resubmission_required"}
      >
        <AlertCircle className="h-4 w-4" />
        Request Resubmission
      </Button>
    </div>
  );
}
