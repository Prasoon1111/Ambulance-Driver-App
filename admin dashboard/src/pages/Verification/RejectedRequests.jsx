import { useMemo, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import VerificationStatusBadge from "../../components/ui/VerificationStatusBadge.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { formatDateTime } from "../../utils/formatters.js";

export default function RejectedRequests() {
  const { pendingDrivers, pendingAmbulances } = useOps();
  const [selected, setSelected] = useState(null);

  const rows = useMemo(
    () => [
      ...pendingDrivers
        .filter((driver) => ["rejected", "resubmission_required"].includes(driver.verificationStatus))
        .map((driver) => ({
          id: driver.id,
          type: "Driver",
          name: driver.fullName,
          hospitalName: driver.hospitalName,
          verificationStatus: driver.verificationStatus,
          rejectionReason: driver.rejectionReason,
          submittedAt: driver.submittedAt,
        })),
      ...pendingAmbulances
        .filter((ambulance) => ["rejected", "resubmission_required"].includes(ambulance.verificationStatus))
        .map((ambulance) => ({
          id: ambulance.id,
          type: "Ambulance",
          name: ambulance.vehicleNumber,
          hospitalName: ambulance.hospitalName,
          verificationStatus: ambulance.verificationStatus,
          rejectionReason: ambulance.rejectionReason,
          submittedAt: ambulance.submittedAt,
        })),
    ],
    [pendingDrivers, pendingAmbulances],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rejected Requests"
        description="Requests that remain editable by hospital admins for correction and resubmission."
      />
      <DataTable
        rows={rows}
        emptyTitle="No rejected or resubmission requests"
        columns={[
          { key: "type", header: "Type" },
          { key: "name", header: "Request", render: (row) => <div><p className="font-medium text-slate-950">{row.name}</p><p className="text-xs text-slate-500">{row.id}</p></div> },
          { key: "hospitalName", header: "Hospital" },
          { key: "verificationStatus", header: "Status", render: (row) => <VerificationStatusBadge status={row.verificationStatus} /> },
          { key: "submittedAt", header: "Submitted Date", render: (row) => formatDateTime(row.submittedAt) },
          { key: "actions", header: "", render: (row) => <Button variant="secondary" size="sm" onClick={() => setSelected(row)}>View Reason</Button> },
        ]}
      />

      <Modal
        open={Boolean(selected)}
        title="Request reason"
        description={selected ? `${selected.type} request ${selected.name}` : ""}
        onClose={() => setSelected(null)}
        footer={<Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>}
      >
        <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {selected?.rejectionReason || "No reason has been recorded yet."}
        </p>
      </Modal>
    </div>
  );
}
