import { useMemo, useState } from "react";
import AmbulancesTable from "../../components/ambulances/AmbulancesTable.jsx";
import Button from "../../components/ui/Button.jsx";
import DocumentViewerModal from "../../components/ui/DocumentViewerModal.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import VerificationActionButtons from "../../components/ui/VerificationActionButtons.jsx";
import VerificationStatusBadge from "../../components/ui/VerificationStatusBadge.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { formatDateTime, matchesSearch } from "../../utils/formatters.js";

const statusOptions = [
  "All statuses",
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Resubmission Required", value: "resubmission_required" },
];

function ambulanceDocuments(ambulance) {
  return [
    ambulance.documents?.rcBook,
    ambulance.documents?.insurance,
    ambulance.documents?.pollutionCertificate,
    ambulance.documents?.vehiclePhotos,
  ];
}

export default function PendingAmbulances() {
  const { pendingAmbulances, pendingAmbulancesActions } = useOps();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [hospital, setHospital] = useState("All hospitals");
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const hospitals = ["All hospitals", ...Array.from(new Set(pendingAmbulances.map((unit) => unit.hospitalName)))];

  const rows = useMemo(
    () =>
      pendingAmbulances.filter(
        (unit) =>
          (status === "All statuses" || unit.verificationStatus === status) &&
          (hospital === "All hospitals" || unit.hospitalName === hospital) &&
          matchesSearch(unit, query, ["vehicleNumber", "hospitalName", "ambulanceType"]),
      ),
    [pendingAmbulances, query, status, hospital],
  );

  const openReason = (type, ambulance) => {
    setSelectedAmbulance(ambulance);
    setReason("");
    setModal(type);
  };

  const submitReason = async () => {
    if (modal === "reject") await pendingAmbulancesActions.reject(selectedAmbulance, reason);
    if (modal === "resubmission") await pendingAmbulancesActions.requestResubmission(selectedAmbulance, reason);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pending Ambulances"
        description="Review hospital-submitted ambulance compliance requests before moving them into the main ambulances collection."
      />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_190px_220px]">
        <Input placeholder="Search vehicle number..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={statusOptions} />
        <Select value={hospital} onChange={(event) => setHospital(event.target.value)} options={hospitals} />
      </div>

      <AmbulancesTable
        rows={rows}
        onViewDetails={(ambulance) => {
          setSelectedAmbulance(ambulance);
          setModal("details");
        }}
        onViewDocuments={(ambulance) => {
          setSelectedAmbulance(ambulance);
          setModal("documents");
        }}
        onApprove={pendingAmbulancesActions.approve}
        onReject={(ambulance) => openReason("reject", ambulance)}
        onRequestResubmission={(ambulance) => openReason("resubmission", ambulance)}
      />

      <Modal
        open={modal === "details"}
        title="Ambulance verification details"
        description={selectedAmbulance ? `${selectedAmbulance.vehicleNumber} submitted by ${selectedAmbulance.hospitalName}` : ""}
        onClose={() => setModal(null)}
        footer={
          selectedAmbulance && (
            <VerificationActionButtons
              record={selectedAmbulance}
              onVerify={pendingAmbulancesActions.approve}
              onReject={(ambulance) => openReason("reject", ambulance)}
              onRequestResubmission={(ambulance) => openReason("resubmission", ambulance)}
            />
          )
        }
      >
        {selectedAmbulance && <AmbulanceDetails ambulance={selectedAmbulance} />}
      </Modal>

      <Modal
        open={modal === "reject" || modal === "resubmission"}
        title={modal === "reject" ? "Reject ambulance request" : "Request ambulance resubmission"}
        description="Add a clear reason so the hospital admin can correct and resubmit the request."
        onClose={() => setModal(null)}
        footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant={modal === "reject" ? "danger" : "primary"} onClick={submitReason}>Submit</Button></>}
      >
        <textarea
          className="focus-ring min-h-32 w-full rounded-md border border-slate-200 p-3 text-sm"
          placeholder="Reason for rejection or resubmission request"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </Modal>

      <DocumentViewerModal
        open={modal === "documents"}
        title={selectedAmbulance ? `${selectedAmbulance.vehicleNumber} documents` : "Ambulance documents"}
        documents={selectedAmbulance ? ambulanceDocuments(selectedAmbulance) : []}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

function AmbulanceDetails({ ambulance }) {
  return (
    <div className="grid gap-4 text-sm sm:grid-cols-2">
      <Detail label="Vehicle number" value={ambulance.vehicleNumber} />
      <Detail label="Hospital" value={ambulance.hospitalName} />
      <Detail label="Ambulance type" value={ambulance.ambulanceType} />
      <Detail label="Insurance expiry" value={ambulance.insuranceExpiry} />
      <Detail label="Pollution expiry" value={ambulance.pollutionExpiry} />
      <Detail label="Submitted" value={formatDateTime(ambulance.submittedAt)} />
      <div className="sm:col-span-2">
        <Detail label="Equipment available" value={ambulance.equipmentAvailable} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Verification status</p>
        <VerificationStatusBadge status={ambulance.verificationStatus} className="mt-2" />
      </div>
      {ambulance.rejectionReason && <Detail label="Latest reason" value={ambulance.rejectionReason} />}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value || "Not provided"}</p>
    </div>
  );
}
