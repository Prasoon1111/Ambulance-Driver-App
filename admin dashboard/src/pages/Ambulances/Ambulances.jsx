import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import AmbulanceForm, { ambulanceDefaults } from "../../components/ambulances/AmbulanceForm.jsx";
import AmbulancesTable from "../../components/ambulances/AmbulancesTable.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { matchesSearch } from "../../utils/formatters.js";

export default function Ambulances() {
  const { ambulances, ambulancesActions, hospitals, drivers } = useOps();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(ambulanceDefaults);

  const rows = useMemo(
    () => ambulances.filter((unit) => (status === "All statuses" || unit.status === status) && matchesSearch(unit, query, ["id", "plate", "hospital", "driver", "type"])),
    [ambulances, query, status],
  );

  const submit = () => {
    if (modal === "edit") ambulancesActions.update(draft.id, draft);
    if (modal === "add") ambulancesActions.add(draft);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Ambulances" description="Manage fleet inventory, GPS readiness, availability, and hospital assignments." actions={<Button onClick={() => { setDraft(ambulanceDefaults); setModal("add"); }}><Plus className="h-4 w-4" />Add ambulance</Button>} />
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
        <Input placeholder="Search ambulances..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="sm:w-52" value={status} onChange={(event) => setStatus(event.target.value)} options={["All statuses", "Available", "En Route", "Standby", "Maintenance", "Offline"]} />
      </div>
      <AmbulancesTable rows={rows} onEdit={(record) => { setDraft(record); setModal("edit"); }} onDelete={(record) => { setDraft(record); setModal("delete"); }} />
      <Modal open={modal === "add" || modal === "edit"} title={modal === "edit" ? "Edit ambulance" : "Add ambulance"} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal === "edit" ? "Save changes" : "Create ambulance"}</Button></>}>
        <AmbulanceForm value={draft} onChange={setDraft} hospitals={hospitals} drivers={drivers} />
      </Modal>
      <Modal open={modal === "delete"} title="Delete ambulance" description={`Remove ${draft.id} from the fleet registry.`} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant="danger" onClick={() => { ambulancesActions.remove(draft.id); setModal(null); }}>Delete</Button></>}>
        <p className="text-sm text-slate-600">Production deletes should be guarded by role checks and audit logging.</p>
      </Modal>
    </div>
  );
}
