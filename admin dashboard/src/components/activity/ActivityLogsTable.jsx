import { formatDateTime } from "../../utils/formatters.js";
import DataTable from "../ui/DataTable.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

export default function ActivityLogsTable({ rows }) {
  return (
    <DataTable
      rows={rows}
      emptyTitle="No activity logs match this view"
      columns={[
        { key: "timestamp", header: "Time", render: (row) => formatDateTime(row.timestamp) },
        { key: "actor", header: "Actor" },
        { key: "category", header: "Category" },
        { key: "event", header: "Event", render: (row) => <span className="whitespace-normal text-slate-700">{row.event}</span> },
        { key: "region", header: "Region" },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
