import { useMemo, useState } from "react";
import EmergencyCards from "../../components/emergencies/EmergencyCards.jsx";
import Input from "../../components/ui/Input.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { matchesSearch } from "../../utils/formatters.js";

export default function Emergencies() {
  const { emergencies } = useOps();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All severity");

  const rows = useMemo(
    () => emergencies.filter((item) => (severity === "All severity" || item.severity === severity) && matchesSearch(item, query, ["id", "patientRef", "region", "ambulance", "hospital", "status"])),
    [emergencies, query, severity],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Active Emergencies" description="Realtime-ready operational view for active dispatches, severity, ETA, and handoff state." />
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
        <Input placeholder="Search emergencies..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="sm:w-48" value={severity} onChange={(event) => setSeverity(event.target.value)} options={["All severity", "Critical", "High", "Medium", "Low"]} />
      </div>
      <EmergencyCards rows={rows} />
    </div>
  );
}
