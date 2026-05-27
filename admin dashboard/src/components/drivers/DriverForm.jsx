import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";

export const driverDefaults = {
  fullName: "",
  address: "",
  phone: "",
  email: "",
  gender: "Male",
  hospitalName: "",
  aadharNumber: "",
  drivingLicenseNumber: "",
  aadhaarStatus: "pending",
  licenceStatus: "pending",
  verificationStatus: "pending",
  submittedAt: "",
  documents: {
    aadhaarCard: null,
    drivingLicense: null,
    profilePhoto: null,
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

function FileInput({ label, accept, onChange }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        type="file"
        accept={accept}
        className="focus-ring block w-full rounded-md border border-slate-200 bg-white text-sm text-slate-700 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}

export default function DriverForm({ value, onChange, hospitals }) {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });
  const updateDocument = (field, file, label) =>
    onChange({
      ...value,
      documents: {
        ...value.documents,
        [field]: fileToDocument(file, label),
      },
    });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Full name" value={value.fullName} onChange={(event) => update("fullName", event.target.value)} />
      <Input label="Phone" value={value.phone} onChange={(event) => update("phone", event.target.value)} />
      <Input label="Email" type="email" value={value.email} onChange={(event) => update("email", event.target.value)} />
      <Select label="Gender" value={value.gender} onChange={(event) => update("gender", event.target.value)} options={["Male", "Female", "Other"]} />
      <Select label="Hospital name" value={value.hospitalName} onChange={(event) => update("hospitalName", event.target.value)} options={["", ...hospitals.map((item) => item.name)]} />
      <Input label="Aadhaar number" value={value.aadharNumber} onChange={(event) => update("aadharNumber", event.target.value)} />
      <Input label="Driving licence number" value={value.drivingLicenseNumber} onChange={(event) => update("drivingLicenseNumber", event.target.value)} />
      <div className="sm:col-span-2">
        <Input label="Address" value={value.address} onChange={(event) => update("address", event.target.value)} />
      </div>
      <FileInput label="Aadhaar card" accept="image/*,.pdf" onChange={(file) => updateDocument("aadhaarCard", file, "Aadhaar card")} />
      <FileInput label="Driving licence" accept="image/*,.pdf" onChange={(file) => updateDocument("drivingLicense", file, "Driving licence")} />
      <FileInput label="Profile photo" accept="image/*" onChange={(file) => updateDocument("profilePhoto", file, "Profile photo")} />
    </div>
  );
}
