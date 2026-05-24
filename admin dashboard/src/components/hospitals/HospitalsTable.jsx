import { Edit3, Trash2 } from "lucide-react";
import Button from "../ui/Button.jsx";
import DataTable from "../ui/DataTable.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function HospitalsTable({ rows, onEdit, onDelete }) {
  return (
    <DataTable
      rows={rows}
      emptyTitle="No hospitals match this view"
      columns={[
        {
          key: "name",
          header: "Hospital",
          render: (row) => (
            <div>
              <p className="font-medium text-slate-950">{row.name}</p>
              <p className="text-xs text-slate-500">{row.id}</p>
            </div>
          ),
        },
        { key: "region", header: "Region" },
        { key: "type", header: "Type" },
        {
          key: "capacity",
          header: "Capacity",
          render: (row) => (
            <div className="w-28">
              <div className="h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-slate-900" style={{ width: `${row.capacity}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{row.capacity}% intake load</p>
            </div>
          ),
        },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        {
          key: "actions",
          header: "",
          render: (row) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label={`Edit ${row.name}`}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(row)} aria-label={`Delete ${row.name}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
