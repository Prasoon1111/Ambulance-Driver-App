import { useMemo, useState } from "react";
import DriversTable from "../../components/drivers/DriversTable.jsx";
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

function matchesDateFilter(value, filter) {
  if (filter === "All dates") return true;
  const submitted = new Date(value);
  const now = new Date();
  const diffDays = (now - submitted) / (1000 * 60 * 60 * 24);
  if (filter === "Today") return submitted.toDateString() === now.toDateString();
  if (filter === "Last 7 days") return diffDays <= 7;
  return diffDays > 7;
}

function driverDocuments(driver) {
  return [driver.documents?.aadhaarCard, driver.documents?.drivingLicense, driver.documents?.profilePhoto];
}

export default function PendingDrivers() {
  const { pendingDrivers, pendingDriversActions } = useOps();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [hospital, setHospital] = useState("All hospitals");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const hospitals = ["All hospitals", ...Array.from(new Set(pendingDrivers.map((driver) => driver.hospitalName)))];

  const rows = useMemo(
    () =>
      pendingDrivers.filter(
        (driver) =>
          (status === "All statuses" || driver.verificationStatus === status) &&
          (hospital === "All hospitals" || driver.hospitalName === hospital) &&
          matchesDateFilter(driver.submittedAt, dateFilter) &&
          matchesSearch(driver, query, ["fullName", "phone", "hospitalName", "email"]),
      ),
    [pendingDrivers, query, status, hospital, dateFilter],
  );

  const openReason = (type, driver) => {
    setSelectedDriver(driver);
    setReason("");
    setModal(type);
  };

  const submitReason = async () => {
    if (modal === "reject") await pendingDriversActions.reject(selectedDriver, reason);
    if (modal === "resubmission") await pendingDriversActions.requestResubmission(selectedDriver, reason);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pending Drivers"
        description="Review hospital-submitted driver requests before moving them into the main drivers collection."
      />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_190px_220px_160px]">
        <Input placeholder="Search driver name or phone..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={statusOptions} />
        <Select value={hospital} onChange={(event) => setHospital(event.target.value)} options={hospitals} />
        <Select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} options={["All dates", "Today", "Last 7 days", "Older"]} />
      </div>

      <DriversTable
        rows={rows}
        onViewDetails={(driver) => {
          setSelectedDriver(driver);
          setModal("details");
        }}
        onViewDocuments={(driver) => {
          setSelectedDriver(driver);
          setModal("documents");
        }}
        onApprove={pendingDriversActions.approve}
        onReject={(driver) => openReason("reject", driver)}
        onRequestResubmission={(driver) => openReason("resubmission", driver)}
      />

      <Modal
        open={modal === "details"}
        title="Driver verification details"
        description={selectedDriver ? `${selectedDriver.fullName} submitted by ${selectedDriver.hospitalName}` : ""}
        onClose={() => setModal(null)}
        footer={
          selectedDriver && (
            <VerificationActionButtons
              record={selectedDriver}
              onVerify={pendingDriversActions.approve}
              onReject={(driver) => openReason("reject", driver)}
              onRequestResubmission={(driver) => openReason("resubmission", driver)}
            />
          )
        }
      >
        {selectedDriver && <DriverDetails driver={selectedDriver} />}
      </Modal>

      <Modal
        open={modal === "reject" || modal === "resubmission"}
        title={modal === "reject" ? "Reject driver request" : "Request driver resubmission"}
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
        title={selectedDriver ? `${selectedDriver.fullName} documents` : "Driver documents"}
        documents={selectedDriver ? driverDocuments(selectedDriver) : []}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

function DriverDetails({ driver }) {
  return (
    <div className="grid gap-4 text-sm sm:grid-cols-2">
      <Detail label="Full name" value={driver.fullName} />
      <Detail label="Hospital" value={driver.hospitalName} />
      <Detail label="Phone" value={driver.phone} />
      <Detail label="Email" value={driver.email} />
      <Detail label="Gender" value={driver.gender} />
      <Detail label="Aadhaar number" value={driver.aadharNumber} />
      <Detail label="Driving licence" value={driver.drivingLicenseNumber} />
      <Detail label="Submitted" value={formatDateTime(driver.submittedAt)} />
      <div className="sm:col-span-2">
        <Detail label="Address" value={driver.address} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Verification status</p>
        <VerificationStatusBadge status={driver.verificationStatus} className="mt-2" />
      </div>
      {driver.rejectionReason && <Detail label="Latest reason" value={driver.rejectionReason} />}
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
