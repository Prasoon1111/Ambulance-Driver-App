export const overviewStats = [
  { label: "Active emergencies", value: "38", detail: "9 critical severity", trend: "+6 in 30m", tone: "danger" },
  { label: "Ambulances online", value: "142", detail: "91% fleet availability", trend: "12 maintenance holds", tone: "success" },
  { label: "Hospitals connected", value: "64", detail: "17 trauma centers", trend: "3 degraded feeds", tone: "neutral" },
  { label: "Median dispatch", value: "04:48", detail: "Global response time", trend: "-18s today", tone: "success" },
];

export const initialHospitals = [
  { id: "HSP-001", name: "Mercy General Hospital", region: "New York, US", type: "Trauma Center", capacity: 82, contact: "ops@mercy-general.com", status: "Operational" },
  { id: "HSP-002", name: "St. Catherine Medical", region: "London, UK", type: "Cardiac Center", capacity: 64, contact: "control@stcatherine.nhs", status: "Operational" },
  { id: "HSP-003", name: "Harborview Emergency", region: "Seattle, US", type: "Emergency Network", capacity: 93, contact: "dispatch@harborview.org", status: "High Load" },
  { id: "HSP-004", name: "Apollo Metro Care", region: "Bengaluru, IN", type: "Multi-specialty", capacity: 71, contact: "command@apollometro.in", status: "Operational" },
  { id: "HSP-005", name: "Central City Children", region: "Toronto, CA", type: "Pediatric", capacity: 47, contact: "admin@ccchildren.ca", status: "Limited Intake" },
];

export const initialDrivers = [
  { id: "DRV-1042", name: "Maya Ortiz", phone: "+1 212 555 0198", ambulance: "AMB-221", hospital: "Mercy General Hospital", status: "On Call", shift: "07:00-19:00" },
  { id: "DRV-1188", name: "Daniel Brooks", phone: "+44 20 7946 0341", ambulance: "AMB-447", hospital: "St. Catherine Medical", status: "Dispatched", shift: "11:00-23:00" },
  { id: "DRV-1260", name: "Aisha Khan", phone: "+91 80 5550 1400", ambulance: "AMB-309", hospital: "Apollo Metro Care", status: "Available", shift: "06:00-18:00" },
  { id: "DRV-1309", name: "Leo Chen", phone: "+1 206 555 0167", ambulance: "AMB-178", hospital: "Harborview Emergency", status: "Break", shift: "13:00-01:00" },
];

export const initialAmbulances = [
  { id: "AMB-221", plate: "NYC-8K21", type: "ALS", hospital: "Mercy General Hospital", driver: "Maya Ortiz", status: "En Route", gps: "Online", lastPing: "18 sec ago" },
  { id: "AMB-447", plate: "LDN-44X", type: "BLS", hospital: "St. Catherine Medical", driver: "Daniel Brooks", status: "Available", gps: "Online", lastPing: "25 sec ago" },
  { id: "AMB-309", plate: "KA-03-MD-2201", type: "ICU", hospital: "Apollo Metro Care", driver: "Aisha Khan", status: "Available", gps: "Online", lastPing: "14 sec ago" },
  { id: "AMB-178", plate: "SEA-71P", type: "ALS", hospital: "Harborview Emergency", driver: "Leo Chen", status: "Maintenance", gps: "Offline", lastPing: "16 min ago" },
  { id: "AMB-512", plate: "TOR-5B77", type: "Neonatal", hospital: "Central City Children", driver: "Unassigned", status: "Standby", gps: "Online", lastPing: "31 sec ago" },
];

export const initialEmergencies = [
  { id: "EMG-90482", patientRef: "PX-18K", region: "Manhattan, US", severity: "Critical", status: "Dispatching", ambulance: "AMB-221", hospital: "Mercy General Hospital", eta: "04:20", openedAt: "2026-05-12T12:52:00Z" },
  { id: "EMG-90481", patientRef: "PX-77A", region: "Southwark, UK", severity: "High", status: "En Route", ambulance: "AMB-447", hospital: "St. Catherine Medical", eta: "07:10", openedAt: "2026-05-12T12:47:00Z" },
  { id: "EMG-90479", patientRef: "PX-62C", region: "Indiranagar, IN", severity: "Medium", status: "At Scene", ambulance: "AMB-309", hospital: "Apollo Metro Care", eta: "11:35", openedAt: "2026-05-12T12:38:00Z" },
  { id: "EMG-90475", patientRef: "PX-44Q", region: "Seattle, US", severity: "High", status: "Awaiting Handoff", ambulance: "AMB-512", hospital: "Harborview Emergency", eta: "02:45", openedAt: "2026-05-12T12:21:00Z" },
];

export const initialActivityLogs = [
  { id: "LOG-8001", timestamp: "2026-05-12T12:56:00Z", actor: "Dispatch Engine", category: "Routing", event: "Assigned AMB-221 to EMG-90482", status: "Success", region: "New York, US" },
  { id: "LOG-8000", timestamp: "2026-05-12T12:54:00Z", actor: "System Health", category: "Integration", event: "Harborview capacity feed latency exceeded 45s", status: "Warning", region: "Seattle, US" },
  { id: "LOG-7999", timestamp: "2026-05-12T12:50:00Z", actor: "Nora Admin", category: "Hospital", event: "Updated intake status for Central City Children", status: "Info", region: "Toronto, CA" },
  { id: "LOG-7998", timestamp: "2026-05-12T12:46:00Z", actor: "GPS Monitor", category: "Fleet", event: "AMB-178 GPS marked offline", status: "Warning", region: "Seattle, US" },
  { id: "LOG-7997", timestamp: "2026-05-12T12:43:00Z", actor: "Role Service", category: "Access", event: "Created hospital dispatcher role template", status: "Success", region: "Global" },
];

export const systemPanels = [
  { label: "API gateway", status: "Operational", metric: "99.99%", helper: "p95 184 ms" },
  { label: "Realtime channel", status: "Operational", metric: "8.2k", helper: "open sockets" },
  { label: "GPS ingestion", status: "Degraded", metric: "2 feeds", helper: "delayed over 60s" },
  { label: "Hospital sync", status: "Operational", metric: "64/67", helper: "connected sites" },
];
