import { useMemo, useState } from "react";
import DataTable from "../../components/ui/DataTable.jsx";
import DocumentViewerModal from "../../components/ui/DocumentViewerModal.jsx";
import Input from "../../components/ui/Input.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { formatDateTime, matchesSearch } from "../../utils/formatters.js";

function driverDocuments(driver) {
  return [driver.documents?.aadhaarCard, driver.documents?.drivingLicense, driver.documents?.profilePhoto];
}

export default function Drivers() {
  const { drivers } = useOps();
  const [query, setQuery] = useState("");
  const [hospital, setHospital] = useState("All hospitals");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const hospitals = ["All hospitals", ...Array.from(new Set(drivers.map((driver) => driver.hospitalName)))];

  const rows = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          (hospital === "All hospitals" || driver.hospitalName === hospital) &&
          matchesSearch(driver, query, ["fullName", "phone", "hospitalName", "email"]),
      ),
    [drivers, query, hospital],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Drivers"
        description="Verified driver accounts from the main drivers collection. Login access is enabled only after approval."
      />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_240px]">
        <Input placeholder="Search verified drivers..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={hospital} onChange={(event) => setHospital(event.target.value)} options={hospitals} />
      </div>
      <DataTable
        rows={rows}
        emptyTitle="No verified drivers found"
        columns={[
          { key: "fullName", header: "Driver", render: (row) => <div><p className="font-medium text-slate-950">{row.fullName}</p><p className="text-xs text-slate-500">{row.id}</p></div> },
          { key: "hospitalName", header: "Hospital" },
          { key: "phone", header: "Phone" },
          { key: "email", header: "Email" },
          { key: "accountAccess", header: "Login Access", render: (row) => <StatusBadge status={row.accountAccess ? "Approved" : "Pending"} /> },
          { key: "approvedAt", header: "Approved Date", render: (row) => formatDateTime(row.approvedAt) },
          { key: "documents", header: "", render: (row) => <button className="text-sm font-medium text-slate-700 hover:text-slate-950" type="button" onClick={() => setSelectedDriver(row)}>View Documents</button> },
        ]}
      />
      <DocumentViewerModal
        open={Boolean(selectedDriver)}
        title={selectedDriver ? `${selectedDriver.fullName} documents` : "Driver documents"}
        documents={selectedDriver ? driverDocuments(selectedDriver) : []}
        onClose={() => setSelectedDriver(null)}
      />
    </div>
  );
}
