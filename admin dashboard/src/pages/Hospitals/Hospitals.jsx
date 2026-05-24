import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import HospitalForm, { hospitalDefaults } from "../../components/hospitals/HospitalForm.jsx";
import HospitalsTable from "../../components/hospitals/HospitalsTable.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import { matchesSearch } from "../../utils/formatters.js";

export default function Hospitals() {
  const { hospitals, hospitalsActions } = useOps();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(hospitalDefaults);

  const rows = useMemo(
    () =>
      hospitals.filter(
        (hospital) =>
          (status === "All statuses" || hospital.status === status) &&
          matchesSearch(hospital, query, ["name", "region", "type", "contact"]),
      ),
    [hospitals, query, status],
  );

  function openAdd() {
    setDraft(hospitalDefaults);
    setModal("add");
  }

  function openEdit(record) {
    setDraft(record);
    setModal("edit");
  }

  function submit() {
    if (modal === "edit") hospitalsActions.update(draft.id, draft);
    if (modal === "add") hospitalsActions.add(draft);
    setModal(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hospitals"
        description="Manage connected hospitals, operational status, contacts, and intake capacity."
        actions={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add hospital</Button>}
      />
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
        <Input placeholder="Search hospitals..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="sm:w-52" value={status} onChange={(event) => setStatus(event.target.value)} options={["All statuses", "Operational", "High Load", "Limited Intake", "Offline"]} />
      </div>
      <HospitalsTable rows={rows} onEdit={openEdit} onDelete={(record) => { setDraft(record); setModal("delete"); }} />

      <Modal
        open={modal === "add" || modal === "edit"}
        title={modal === "edit" ? "Edit hospital" : "Add hospital"}
        description="Hospital records are structured to map directly to a Firestore collection later."
        onClose={() => setModal(null)}
        footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal === "edit" ? "Save changes" : "Create hospital"}</Button></>}
      >
        <HospitalForm value={draft} onChange={setDraft} />
      </Modal>

      <Modal
        open={modal === "delete"}
        title="Delete hospital"
        description={`Remove ${draft.name} from the admin console mock store.`}
        onClose={() => setModal(null)}
        footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant="danger" onClick={() => { hospitalsActions.remove(draft.id); setModal(null); }}>Delete</Button></>}
      >
        <p className="text-sm text-slate-600">This action only affects local frontend state until the Firebase repository is connected.</p>
      </Modal>
    </div>
  );
}
