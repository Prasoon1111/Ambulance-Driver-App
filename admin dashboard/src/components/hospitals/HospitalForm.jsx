import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";

export const hospitalDefaults = {
  name: "",
  region: "",
  type: "Trauma Center",
  capacity: 70,
  contact: "",
  status: "Operational",
};

export default function HospitalForm({ value, onChange }) {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Hospital name" value={value.name} onChange={(event) => update("name", event.target.value)} />
      <Input label="Region" value={value.region} onChange={(event) => update("region", event.target.value)} />
      <Select label="Type" value={value.type} onChange={(event) => update("type", event.target.value)} options={["Trauma Center", "Cardiac Center", "Emergency Network", "Multi-specialty", "Pediatric"]} />
      <Select label="Status" value={value.status} onChange={(event) => update("status", event.target.value)} options={["Operational", "High Load", "Limited Intake", "Offline"]} />
      <Input label="Capacity %" type="number" min="0" max="100" value={value.capacity} onChange={(event) => update("capacity", Number(event.target.value))} />
      <Input label="Admin contact" value={value.contact} onChange={(event) => update("contact", event.target.value)} />
    </div>
  );
}
