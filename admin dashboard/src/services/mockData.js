export const overviewStats = [
  { label: "Pending Driver Verifications", value: "0", detail: "Awaiting super admin review", trend: "live queue", tone: "warning" },
  { label: "Pending Ambulance Verifications", value: "0", detail: "Documents under review", trend: "live queue", tone: "warning" },
  { label: "Approved Drivers", value: "0", detail: "Verified and active", trend: "credentialed", tone: "success" },
  { label: "Active Ambulances", value: "0", detail: "Approved fleet records", trend: "available for dispatch", tone: "success" },
];

export const initialHospitals = [
  { id: "HSP-001", name: "Mercy General Hospital", region: "New York, US", type: "Trauma Center", capacity: 82, contact: "ops@mercy-general.com", status: "Operational" },
  { id: "HSP-002", name: "St. Catherine Medical", region: "London, UK", type: "Cardiac Center", capacity: 64, contact: "control@stcatherine.nhs", status: "Operational" },
  { id: "HSP-003", name: "Harborview Emergency", region: "Seattle, US", type: "Emergency Network", capacity: 93, contact: "dispatch@harborview.org", status: "High Load" },
  { id: "HSP-004", name: "Apollo Metro Care", region: "Bengaluru, IN", type: "Multi-specialty", capacity: 71, contact: "command@apollometro.in", status: "Operational" },
  { id: "HSP-005", name: "Central City Children", region: "Toronto, CA", type: "Pediatric", capacity: 47, contact: "admin@ccchildren.ca", status: "Limited Intake" },
];

const profilePhotoUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320' viewBox='0 0 480 320'%3E%3Crect width='480' height='320' fill='%23f1f5f9'/%3E%3Ccircle cx='240' cy='124' r='54' fill='%2394a3b8'/%3E%3Cpath d='M135 284c22-62 188-62 210 0' fill='%2394a3b8'/%3E%3Ctext x='240' y='302' text-anchor='middle' font-family='Arial' font-size='18' fill='%23334155'%3EDriver profile photo%3C/text%3E%3C/svg%3E";
const vehiclePhotoUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='320' viewBox='0 0 520 320'%3E%3Crect width='520' height='320' fill='%23f8fafc'/%3E%3Crect x='86' y='138' width='348' height='86' rx='14' fill='%23e2e8f0' stroke='%2394a3b8'/%3E%3Crect x='132' y='104' width='158' height='52' rx='10' fill='%23dbeafe' stroke='%2394a3b8'/%3E%3Ccircle cx='165' cy='232' r='28' fill='%23334155'/%3E%3Ccircle cx='370' cy='232' r='28' fill='%23334155'/%3E%3Ctext x='260' y='190' text-anchor='middle' font-family='Arial' font-size='26' font-weight='700' fill='%23dc2626'%3EAMBULANCE%3C/text%3E%3C/svg%3E";

function documentFile(label, name, type = "application/pdf", url = "data:text/plain;charset=utf-8,Verification%20document%20placeholder") {
  return { label, name, type, url };
}

const driverVerificationSeed = [
  {
    id: "DRV-1042",
    fullName: "Rahul Sharma",
    address: "42 MG Road, Bengaluru, Karnataka",
    phone: "+91 98765 41042",
    email: "rahul.sharma@example.com",
    gender: "Male",
    hospitalName: "Apollo Metro Care",
    aadharNumber: "4821 6409 1182",
    drivingLicenseNumber: "KA03-2021-7788123",
    aadhaarStatus: "pending",
    licenceStatus: "pending",
    verificationStatus: "pending",
    submittedAt: "2026-05-26T04:35:00+05:30",
    documents: {
      aadhaarCard: documentFile("Aadhaar card", "rahul-aadhaar.pdf"),
      drivingLicense: documentFile("Driving licence", "rahul-driving-licence.pdf"),
      profilePhoto: documentFile("Profile photo", "rahul-profile-photo.svg", "image/svg+xml", profilePhotoUrl),
    },
  },
  {
    id: "DRV-1188",
    fullName: "Maya Ortiz",
    address: "118 Hudson Street, New York, US",
    phone: "+1 212 555 0198",
    email: "maya.ortiz@example.com",
    gender: "Female",
    hospitalName: "Mercy General Hospital",
    aadharNumber: "N/A",
    drivingLicenseNumber: "NY-DL-8821402",
    aadhaarStatus: "approved",
    licenceStatus: "approved",
    verificationStatus: "approved",
    submittedAt: "2026-05-25T18:10:00+05:30",
    documents: {
      aadhaarCard: documentFile("Identity document", "maya-identity.pdf"),
      drivingLicense: documentFile("Driving licence", "maya-driving-licence.pdf"),
      profilePhoto: documentFile("Profile photo", "maya-profile-photo.svg", "image/svg+xml", profilePhotoUrl),
    },
  },
  {
    id: "DRV-1260",
    fullName: "Aisha Khan",
    address: "221 Indiranagar 12th Main, Bengaluru",
    phone: "+91 99887 12600",
    email: "aisha.khan@example.com",
    gender: "Female",
    hospitalName: "Apollo Metro Care",
    aadharNumber: "7712 9340 5521",
    drivingLicenseNumber: "KA05-2020-2231409",
    aadhaarStatus: "approved",
    licenceStatus: "rejected",
    verificationStatus: "resubmission_required",
    submittedAt: "2026-05-24T10:20:00+05:30",
    documents: {
      aadhaarCard: documentFile("Aadhaar card", "aisha-aadhaar.pdf"),
      drivingLicense: documentFile("Driving licence", "aisha-driving-licence.pdf"),
      profilePhoto: documentFile("Profile photo", "aisha-profile-photo.svg", "image/svg+xml", profilePhotoUrl),
    },
  },
  {
    id: "DRV-1309",
    fullName: "Daniel Brooks",
    address: "9 King Street, London, UK",
    phone: "+44 20 7946 0341",
    email: "daniel.brooks@example.com",
    gender: "Male",
    hospitalName: "St. Catherine Medical",
    aadharNumber: "N/A",
    drivingLicenseNumber: "UK-DL-3109228",
    aadhaarStatus: "rejected",
    licenceStatus: "approved",
    verificationStatus: "rejected",
    submittedAt: "2026-05-23T15:55:00+05:30",
    documents: {
      aadhaarCard: documentFile("Identity document", "daniel-identity.pdf"),
      drivingLicense: documentFile("Driving licence", "daniel-driving-licence.pdf"),
      profilePhoto: documentFile("Profile photo", "daniel-profile-photo.svg", "image/svg+xml", profilePhotoUrl),
    },
  },
];

const ambulanceVerificationSeed = [
  {
    id: "AMB-221",
    vehicleNumber: "KA-03-MD-2201",
    ambulanceType: "ALS",
    hospitalName: "Apollo Metro Care",
    insuranceExpiry: "2027-02-18",
    pollutionExpiry: "2026-11-30",
    equipmentAvailable: "Oxygen, stretcher, cardiac monitor, trauma kit",
    rcStatus: "pending",
    insuranceStatus: "pending",
    verificationStatus: "pending",
    submittedAt: "2026-05-26T03:40:00+05:30",
    gps: "Online",
    documents: {
      rcBook: documentFile("RC book", "ka03-md2201-rc.pdf"),
      insurance: documentFile("Insurance", "ka03-md2201-insurance.pdf"),
      pollutionCertificate: documentFile("Pollution certificate", "ka03-md2201-puc.pdf"),
      vehiclePhotos: documentFile("Vehicle photos", "ka03-md2201-photo.svg", "image/svg+xml", vehiclePhotoUrl),
    },
  },
  {
    id: "AMB-447",
    vehicleNumber: "NYC-8K21",
    ambulanceType: "BLS",
    hospitalName: "Mercy General Hospital",
    insuranceExpiry: "2027-08-12",
    pollutionExpiry: "2026-10-04",
    equipmentAvailable: "Oxygen, stretcher, first-aid kit",
    rcStatus: "approved",
    insuranceStatus: "approved",
    verificationStatus: "approved",
    submittedAt: "2026-05-25T13:05:00+05:30",
    gps: "Online",
    documents: {
      rcBook: documentFile("RC book", "nyc-8k21-rc.pdf"),
      insurance: documentFile("Insurance", "nyc-8k21-insurance.pdf"),
      pollutionCertificate: documentFile("Pollution certificate", "nyc-8k21-puc.pdf"),
      vehiclePhotos: documentFile("Vehicle photos", "nyc-8k21-photo.svg", "image/svg+xml", vehiclePhotoUrl),
    },
  },
  {
    id: "AMB-309",
    vehicleNumber: "LDN-44X",
    ambulanceType: "ICU",
    hospitalName: "St. Catherine Medical",
    insuranceExpiry: "2026-07-22",
    pollutionExpiry: "2026-08-18",
    equipmentAvailable: "Ventilator, oxygen, defibrillator, infusion pump",
    rcStatus: "approved",
    insuranceStatus: "rejected",
    verificationStatus: "resubmission_required",
    submittedAt: "2026-05-24T09:15:00+05:30",
    gps: "Degraded",
    documents: {
      rcBook: documentFile("RC book", "ldn-44x-rc.pdf"),
      insurance: documentFile("Insurance", "ldn-44x-insurance.pdf"),
      pollutionCertificate: documentFile("Pollution certificate", "ldn-44x-puc.pdf"),
      vehiclePhotos: documentFile("Vehicle photos", "ldn-44x-photo.svg", "image/svg+xml", vehiclePhotoUrl),
    },
  },
  {
    id: "AMB-512",
    vehicleNumber: "TOR-5B77",
    ambulanceType: "Neonatal",
    hospitalName: "Central City Children",
    insuranceExpiry: "2025-12-10",
    pollutionExpiry: "2026-01-09",
    equipmentAvailable: "Neonatal incubator, oxygen, transport monitor",
    rcStatus: "rejected",
    insuranceStatus: "approved",
    verificationStatus: "rejected",
    submittedAt: "2026-05-23T14:30:00+05:30",
    gps: "Offline",
    documents: {
      rcBook: documentFile("RC book", "tor-5b77-rc.pdf"),
      insurance: documentFile("Insurance", "tor-5b77-insurance.pdf"),
      pollutionCertificate: documentFile("Pollution certificate", "tor-5b77-puc.pdf"),
      vehiclePhotos: documentFile("Vehicle photos", "tor-5b77-photo.svg", "image/svg+xml", vehiclePhotoUrl),
    },
  },
];

const hospitalIdByName = Object.fromEntries(initialHospitals.map((hospital) => [hospital.name, hospital.id]));

function normalizeDriverRequest(driver) {
  return {
    ...driver,
    hospitalId: hospitalIdByName[driver.hospitalName],
    aadharUrl: driver.documents?.aadhaarCard?.url || "",
    licenseUrl: driver.documents?.drivingLicense?.url || "",
    profilePhotoUrl: driver.documents?.profilePhoto?.url || "",
    updatedAt: driver.updatedAt || driver.submittedAt,
    rejectionReason: driver.rejectionReason || "",
    editable: driver.verificationStatus !== "approved",
  };
}

function normalizeAmbulanceRequest(ambulance) {
  return {
    ...ambulance,
    hospitalId: hospitalIdByName[ambulance.hospitalName],
    rcBookUrl: ambulance.documents?.rcBook?.url || "",
    insuranceUrl: ambulance.documents?.insurance?.url || "",
    pollutionCertificateUrl: ambulance.documents?.pollutionCertificate?.url || "",
    vehiclePhotos: ambulance.documents?.vehiclePhotos ? [ambulance.documents.vehiclePhotos.url] : [],
    updatedAt: ambulance.updatedAt || ambulance.submittedAt,
    rejectionReason: ambulance.rejectionReason || "",
    editable: ambulance.verificationStatus !== "approved",
  };
}

const normalizedDriverRequests = driverVerificationSeed.map(normalizeDriverRequest);
const normalizedAmbulanceRequests = ambulanceVerificationSeed.map(normalizeAmbulanceRequest);

export const initialPendingDrivers = normalizedDriverRequests.filter(
  (driver) => driver.verificationStatus !== "approved",
);

export const initialDrivers = normalizedDriverRequests
  .filter((driver) => driver.verificationStatus === "approved")
  .map((driver) => ({
    ...driver,
    accountAccess: true,
    editable: false,
    approvedAt: "2026-05-26T04:52:00+05:30",
  }));

export const initialPendingAmbulances = normalizedAmbulanceRequests.filter(
  (ambulance) => ambulance.verificationStatus !== "approved",
);

export const initialAmbulances = normalizedAmbulanceRequests
  .filter((ambulance) => ambulance.verificationStatus === "approved")
  .map((ambulance) => ({
    ...ambulance,
    vehicleActive: true,
    editable: false,
    approvedAt: "2026-05-26T04:02:00+05:30",
  }));

export const initialEmergencies = [
  { id: "EMG-90482", patientRef: "PX-18K", region: "Manhattan, US", severity: "Critical", status: "Dispatching", ambulance: "AMB-221", hospital: "Mercy General Hospital", eta: "04:20", openedAt: "2026-05-12T12:52:00Z" },
  { id: "EMG-90481", patientRef: "PX-77A", region: "Southwark, UK", severity: "High", status: "En Route", ambulance: "AMB-447", hospital: "St. Catherine Medical", eta: "07:10", openedAt: "2026-05-12T12:47:00Z" },
  { id: "EMG-90479", patientRef: "PX-62C", region: "Indiranagar, IN", severity: "Medium", status: "At Scene", ambulance: "AMB-309", hospital: "Apollo Metro Care", eta: "11:35", openedAt: "2026-05-12T12:38:00Z" },
  { id: "EMG-90475", patientRef: "PX-44Q", region: "Seattle, US", severity: "High", status: "Awaiting Handoff", ambulance: "AMB-512", hospital: "Harborview Emergency", eta: "02:45", openedAt: "2026-05-12T12:21:00Z" },
];

export const initialActivityLogs = [
  { id: "LOG-8004", timestamp: "2026-05-26T04:52:00+05:30", actor: "Super Admin", category: "Driver Verification", event: "Super Admin approved driver Maya Ortiz", status: "Success", region: "New York, US" },
  { id: "LOG-8003", timestamp: "2026-05-26T04:44:00+05:30", actor: "Super Admin", category: "Ambulance Verification", event: "Super Admin requested resubmission for ambulance LDN-44X", status: "Warning", region: "London, UK" },
  { id: "LOG-8002", timestamp: "2026-05-26T04:36:00+05:30", actor: "Hospital Admin", category: "Driver Submission", event: "Apollo Metro Care submitted driver Rahul Sharma", status: "Info", region: "Bengaluru, IN" },
  { id: "LOG-8001", timestamp: "2026-05-26T04:20:00+05:30", actor: "Super Admin", category: "Driver Verification", event: "Super Admin rejected driver Daniel Brooks", status: "Warning", region: "London, UK" },
  { id: "LOG-8000", timestamp: "2026-05-26T04:02:00+05:30", actor: "Super Admin", category: "Ambulance Verification", event: "Super Admin approved ambulance NYC-8K21", status: "Success", region: "New York, US" },
];

export const initialDriverAmbulanceAssignments = [
  {
    assignmentId: "ASN-1001",
    driverId: "DRV-1188",
    ambulanceId: "AMB-447",
    hospitalId: "HSP-001",
    shift: "07:00-19:00",
    active: true,
    assignedAt: "2026-05-26T05:00:00+05:30",
  },
];

export const verificationTrend = [
  { day: "May 20", approvals: 8, rejections: 2 },
  { day: "May 21", approvals: 11, rejections: 3 },
  { day: "May 22", approvals: 9, rejections: 2 },
  { day: "May 23", approvals: 14, rejections: 4 },
  { day: "May 24", approvals: 12, rejections: 5 },
  { day: "May 25", approvals: 16, rejections: 3 },
  { day: "May 26", approvals: 18, rejections: 4 },
];

export const systemPanels = [
  { label: "API gateway", status: "Operational", metric: "99.99%", helper: "p95 184 ms" },
  { label: "Realtime channel", status: "Operational", metric: "8.2k", helper: "open sockets" },
  { label: "GPS ingestion", status: "Degraded", metric: "2 feeds", helper: "delayed over 60s" },
  { label: "Hospital sync", status: "Operational", metric: "64/67", helper: "connected sites" },
];
