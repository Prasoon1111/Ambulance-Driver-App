import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/police/StatusBadge";
import { usePoliceStore } from "@/store/policeStore";
import { formatRelativeTime } from "@/utils/format";

export function EmergencyTable({ emergencies }) {
  const selectEmergency = usePoliceStore((state) => state.selectEmergency);

  if (!emergencies.length) {
    return <EmptyState title="No active emergencies match your search" />;
  }

  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHead>Emergency</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Ambulance</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>ETA</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {emergencies.map((emergency) => (
          <TableRow
            key={emergency.id}
            className="cursor-pointer"
            onClick={() => selectEmergency(emergency.id)}
          >
            <TableCell>
              <div>
                <p className="font-semibold text-slate-900">{emergency.id}</p>
                <p className="text-xs text-slate-500">{emergency.type}</p>
              </div>
            </TableCell>
            <TableCell>{emergency.driverName}</TableCell>
            <TableCell className="font-medium">{emergency.ambulanceNumber}</TableCell>
            <TableCell>
              <StatusBadge value={emergency.severity} />
            </TableCell>
            <TableCell className="font-semibold text-slate-900">{emergency.eta}</TableCell>
            <TableCell>{emergency.destinationHospital}</TableCell>
            <TableCell>{emergency.status}</TableCell>
            <TableCell>{formatRelativeTime(emergency.lastUpdated)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
