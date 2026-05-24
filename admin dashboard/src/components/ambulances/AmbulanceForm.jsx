import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";

export const ambulanceDefaults = {
  plate: "",
  type: "ALS",
  hospital: "",
  driver: "Unassigned",
  status: "Available",
  gps: "Online",
  lastPing: "just now",
};

export default function AmbulanceForm({ value, onChange, hospitals, drivers }) {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Plate number" value={value.plate} onChange={(event) => update("plate", event.target.value)} />
      <Select label="Type" value={value.type} onChange={(event) => update("type", event.target.value)} options={["ALS", "BLS", "ICU", "Neonatal"]} />
      <Select label="Assigned hospital" value={value.hospital} onChange={(event) => update("hospital", event.target.value)} options={["", ...hospitals.map((item) => item.name)]} />
      <Select label="Assigned driver" value={value.driver} onChange={(event) => update("driver", event.target.value)} options={["Unassigned", ...drivers.map((item) => item.name)]} />
      <Select label="Availability" value={value.status} onChange={(event) => update("status", event.target.value)} options={["Available", "En Route", "Standby", "Maintenance", "Offline"]} />
      <Select label="GPS status" value={value.gps} onChange={(event) => update("gps", event.target.value)} options={["Online", "Degraded", "Offline"]} />
    </div>
  );
}
