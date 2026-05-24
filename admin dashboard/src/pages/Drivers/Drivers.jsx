import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import DriverForm, { driverDefaults } from "../../components/drivers/DriverForm.jsx";
import DriversTable from "../../components/drivers/DriversTable.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { matchesSearch } from "../../utils/formatters.js";

export default function Drivers() {
  const { drivers, driversActions, hospitals, ambulances } = useOps();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(driverDefaults);

  const rows = useMemo(
    () => drivers.filter((driver) => (status === "All statuses" || driver.status === status) && matchesSearch(driver, query, ["name", "phone", "ambulance", "hospital"])),
    [drivers, query, status],
  );

  const submit = () => {
    if (modal === "edit") driversActions.update(draft.id, draft);
    if (modal === "add") driversActions.add(draft);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Drivers" description="Manage driver assignments, dispatch readiness, and shift coverage." actions={<Button onClick={() => { setDraft(driverDefaults); setModal("add"); }}><Plus className="h-4 w-4" />Add driver</Button>} />
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
        <Input placeholder="Search drivers..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="sm:w-52" value={status} onChange={(event) => setStatus(event.target.value)} options={["All statuses", "Available", "On Call", "Dispatched", "Break", "Offline"]} />
      </div>
      <DriversTable rows={rows} onEdit={(record) => { setDraft(record); setModal("edit"); }} onDelete={(record) => { setDraft(record); setModal("delete"); }} />
      <Modal open={modal === "add" || modal === "edit"} title={modal === "edit" ? "Edit driver" : "Add driver"} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal === "edit" ? "Save changes" : "Create driver"}</Button></>}>
        <DriverForm value={draft} onChange={setDraft} hospitals={hospitals} ambulances={ambulances} />
      </Modal>
      <Modal open={modal === "delete"} title="Delete driver" description={`Remove ${draft.name} from the driver registry.`} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant="danger" onClick={() => { driversActions.remove(draft.id); setModal(null); }}>Delete</Button></>}>
        <p className="text-sm text-slate-600">Driver assignment history can be preserved later through Firestore audit collections.</p>
      </Modal>
    </div>
  );
}
