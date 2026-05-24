import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";

export const driverDefaults = {
  name: "",
  phone: "",
  ambulance: "Unassigned",
  hospital: "",
  status: "Available",
  shift: "07:00-19:00",
};

export default function DriverForm({ value, onChange, hospitals, ambulances }) {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Driver name" value={value.name} onChange={(event) => update("name", event.target.value)} />
      <Input label="Phone" value={value.phone} onChange={(event) => update("phone", event.target.value)} />
      <Select label="Assigned ambulance" value={value.ambulance} onChange={(event) => update("ambulance", event.target.value)} options={["Unassigned", ...ambulances.map((item) => item.id)]} />
      <Select label="Assigned hospital" value={value.hospital} onChange={(event) => update("hospital", event.target.value)} options={["", ...hospitals.map((item) => item.name)]} />
      <Select label="Status" value={value.status} onChange={(event) => update("status", event.target.value)} options={["Available", "On Call", "Dispatched", "Break", "Offline"]} />
      <Input label="Shift" value={value.shift} onChange={(event) => update("shift", event.target.value)} />
    </div>
  );
}
