import { useMemo, useState } from "react";
import DataTable from "../../components/ui/DataTable.jsx";
import DocumentViewerModal from "../../components/ui/DocumentViewerModal.jsx";
import Input from "../../components/ui/Input.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { formatDateTime, matchesSearch } from "../../utils/formatters.js";

function ambulanceDocuments(ambulance) {
  return [
    ambulance.documents?.rcBook,
    ambulance.documents?.insurance,
    ambulance.documents?.pollutionCertificate,
    ambulance.documents?.vehiclePhotos,
  ];
}

export default function Ambulances() {
  const { ambulances } = useOps();
  const [query, setQuery] = useState("");
  const [hospital, setHospital] = useState("All hospitals");
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const hospitals = ["All hospitals", ...Array.from(new Set(ambulances.map((unit) => unit.hospitalName)))];

  const rows = useMemo(
    () =>
      ambulances.filter(
        (unit) =>
          (hospital === "All hospitals" || unit.hospitalName === hospital) &&
          matchesSearch(unit, query, ["vehicleNumber", "hospitalName", "ambulanceType"]),
      ),
    [ambulances, query, hospital],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ambulances"
        description="Verified ambulance records from the main ambulances collection. Vehicles become active only after approval."
      />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_240px]">
        <Input placeholder="Search vehicle number..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={hospital} onChange={(event) => setHospital(event.target.value)} options={hospitals} />
      </div>
      <DataTable
        rows={rows}
        emptyTitle="No verified ambulances found"
        columns={[
          { key: "vehicleNumber", header: "Vehicle", render: (row) => <div><p className="font-medium text-slate-950">{row.vehicleNumber}</p><p className="text-xs text-slate-500">{row.id}</p></div> },
          { key: "hospitalName", header: "Hospital" },
          { key: "ambulanceType", header: "Type" },
          { key: "insuranceExpiry", header: "Insurance Expiry" },
          { key: "pollutionExpiry", header: "Pollution Expiry" },
          { key: "vehicleActive", header: "Active", render: (row) => <StatusBadge status={row.vehicleActive ? "Approved" : "Pending"} /> },
          { key: "approvedAt", header: "Approved Date", render: (row) => formatDateTime(row.approvedAt) },
          { key: "documents", header: "", render: (row) => <button className="text-sm font-medium text-slate-700 hover:text-slate-950" type="button" onClick={() => setSelectedAmbulance(row)}>View Documents</button> },
        ]}
      />
      <DocumentViewerModal
        open={Boolean(selectedAmbulance)}
        title={selectedAmbulance ? `${selectedAmbulance.vehicleNumber} documents` : "Ambulance documents"}
        documents={selectedAmbulance ? ambulanceDocuments(selectedAmbulance) : []}
        onClose={() => setSelectedAmbulance(null)}
      />
    </div>
  );
}
