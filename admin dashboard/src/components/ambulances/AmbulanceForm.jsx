import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";

export const ambulanceDefaults = {
  vehicleNumber: "",
  ambulanceType: "ALS",
  hospitalName: "",
  insuranceExpiry: "",
  pollutionExpiry: "",
  equipmentAvailable: "",
  rcStatus: "pending",
  insuranceStatus: "pending",
  verificationStatus: "pending",
  submittedAt: "",
  gps: "Online",
  documents: {
    rcBook: null,
    insurance: null,
    pollutionCertificate: null,
    vehiclePhotos: null,
  },
};

function fileToDocument(file, label) {
  if (!file) return null;
  return {
    label,
    name: file.name,
    type: file.type,
    url: URL.createObjectURL(file),
  };
}

function FileInput({ label, accept, multiple, onChange }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="focus-ring block w-full rounded-md border border-slate-200 bg-white text-sm text-slate-700 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
        onChange={(event) => onChange(event.target.files)}
      />
    </label>
  );
}

export default function AmbulanceForm({ value, onChange, hospitals }) {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });
  const updateDocument = (field, files, label) => {
    const file = files?.[0] || null;
    onChange({
      ...value,
      documents: {
        ...value.documents,
        [field]: fileToDocument(file, label),
      },
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Vehicle number" value={value.vehicleNumber} onChange={(event) => update("vehicleNumber", event.target.value)} />
      <Select label="Ambulance type" value={value.ambulanceType} onChange={(event) => update("ambulanceType", event.target.value)} options={["ALS", "BLS", "ICU", "Neonatal"]} />
      <Select label="Hospital name" value={value.hospitalName} onChange={(event) => update("hospitalName", event.target.value)} options={["", ...hospitals.map((item) => item.name)]} />
      <Input label="Insurance expiry" type="date" value={value.insuranceExpiry} onChange={(event) => update("insuranceExpiry", event.target.value)} />
      <Input label="Pollution expiry" type="date" value={value.pollutionExpiry} onChange={(event) => update("pollutionExpiry", event.target.value)} />
      <div className="sm:col-span-2">
        <Input label="Equipment available" value={value.equipmentAvailable} onChange={(event) => update("equipmentAvailable", event.target.value)} />
      </div>
      <FileInput label="RC book" accept="image/*,.pdf" onChange={(files) => updateDocument("rcBook", files, "RC book")} />
      <FileInput label="Insurance" accept="image/*,.pdf" onChange={(files) => updateDocument("insurance", files, "Insurance")} />
      <FileInput label="Pollution certificate" accept="image/*,.pdf" onChange={(files) => updateDocument("pollutionCertificate", files, "Pollution certificate")} />
      <FileInput label="Vehicle photos" accept="image/*" multiple onChange={(files) => updateDocument("vehiclePhotos", files, "Vehicle photos")} />
    </div>
  );
}
