import { Edit3, Trash2 } from "lucide-react";
import Button from "../ui/Button.jsx";
import DataTable from "../ui/DataTable.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function AmbulancesTable({ rows, onEdit, onDelete }) {
  return (
    <DataTable
      rows={rows}
      emptyTitle="No ambulances match this view"
      columns={[
        { key: "id", header: "Unit", render: (row) => <div><p className="font-medium text-slate-950">{row.id}</p><p className="text-xs text-slate-500">{row.plate}</p></div> },
        { key: "type", header: "Type" },
        { key: "hospital", header: "Hospital" },
        { key: "driver", header: "Driver" },
        { key: "status", header: "Availability", render: (row) => <StatusBadge status={row.status} /> },
        { key: "gps", header: "GPS", render: (row) => <div><StatusBadge status={row.gps} /><p className="mt-1 text-xs text-slate-500">{row.lastPing}</p></div> },
        { key: "actions", header: "", render: (row) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label={`Edit ${row.id}`}><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(row)} aria-label={`Delete ${row.id}`}><Trash2 className="h-4 w-4" /></Button></div> },
      ]}
    />
  );
}
