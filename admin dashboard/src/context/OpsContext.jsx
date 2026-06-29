import { createContext, useContext, useMemo, useState } from "react";
import {
  initialActivityLogs,
  initialAmbulances,
  initialDrivers,
  initialDriverAmbulanceAssignments,
  initialEmergencies,
  initialHospitals,
  initialPendingAmbulances,
  initialPendingDrivers,
  systemPanels,
  verificationTrend,
} from "../services/mockData.js";
import { verificationService } from "../services/verificationService.js";

const OpsContext = createContext(null);

function nextId(prefix, items) {
  const number = items.length + Math.floor(100 + Math.random() * 800);
  return `${prefix}-${number}`;
}

function createActivity(event, category, status = "Info", region = "Global") {
  return {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Super Admin",
    category,
    event,
    status,
    region,
  };
}

function createNotification(type, hospitalId, message) {
  return {
    id: `NTF-${Date.now()}`,
    type,
    hospitalId,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export function OpsProvider({ children }) {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [pendingDrivers, setPendingDrivers] = useState(initialPendingDrivers);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [pendingAmbulances, setPendingAmbulances] = useState(initialPendingAmbulances);
  const [ambulances, setAmbulances] = useState(initialAmbulances);
  const [emergencies] = useState(initialEmergencies);
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);
  const [assignments, setAssignments] = useState(initialDriverAmbulanceAssignments);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    adminName: "Nora Patel",
    email: "nora.patel@resqops.com",
    role: "Super Admin",
    notifications: true,
    criticalOnly: false,
    timezone: "Asia/Calcutta",
    dispatchMode: "Balanced",
  });

  const crud = (setter, prefix) => ({
    add(record) {
      setter((items) => [
        {
          ...record,
          id: record.id || nextId(prefix, items),
          submittedAt: record.submittedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...items,
      ]);
    },
    update(id, patch) {
      setter((items) => items.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item)));
    },
    remove(id) {
      setter((items) => items.filter((item) => item.id !== id));
    },
  });

  const addActivity = (event, category, status = "Info", region = "Global") => {
    setActivityLogs((logs) => [createActivity(event, category, status, region), ...logs]);
  };

  const addNotification = (type, hospitalId, message) => {
    setNotifications((items) => [createNotification(type, hospitalId, message), ...items]);
  };

  const approvePendingDriver = async (driver) => {
    await verificationService.approveDriver(driver.id);
    const approvedDriver = {
      ...driver,
      verificationStatus: "approved",
      aadhaarStatus: "approved",
      licenceStatus: "approved",
      accountAccess: true,
      editable: false,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPendingDrivers((items) => items.filter((item) => item.id !== driver.id));
    setDrivers((items) => [approvedDriver, ...items]);
    addNotification("driver_approved", driver.hospitalId, `Driver ${driver.fullName} approved`);
    addActivity(`Super Admin approved driver ${driver.fullName}`, "Driver Verification", "Success", driver.hospitalName);
  };

  const rejectPendingDriver = async (driver, rejectionReason = "") => {
    await verificationService.rejectDriver(driver.id, rejectionReason);
    setPendingDrivers((items) =>
      items.map((item) =>
        item.id === driver.id
          ? {
              ...item,
              verificationStatus: "rejected",
              rejectionReason,
              editable: true,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    addNotification("driver_rejected", driver.hospitalId, `Driver ${driver.fullName} rejected`);
    addActivity(`Super Admin rejected driver ${driver.fullName}`, "Driver Verification", "Warning", driver.hospitalName);
  };

  const requestDriverResubmission = async (driver, rejectionReason = "") => {
    await verificationService.requestDriverResubmission(driver.id, rejectionReason);
    setPendingDrivers((items) =>
      items.map((item) =>
        item.id === driver.id
          ? {
              ...item,
              verificationStatus: "resubmission_required",
              rejectionReason,
              editable: true,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    addNotification("resubmission_required", driver.hospitalId, `Resubmission requested for driver ${driver.fullName}`);
    addActivity(`Super Admin requested resubmission for driver ${driver.fullName}`, "Driver Verification", "Warning", driver.hospitalName);
  };

  const approvePendingAmbulance = async (ambulance) => {
    await verificationService.approveAmbulance(ambulance.id);
    const approvedAmbulance = {
      ...ambulance,
      verificationStatus: "approved",
      rcStatus: "approved",
      insuranceStatus: "approved",
      vehicleActive: true,
      editable: false,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPendingAmbulances((items) => items.filter((item) => item.id !== ambulance.id));
    setAmbulances((items) => [approvedAmbulance, ...items]);
    addNotification("ambulance_approved", ambulance.hospitalId, `Ambulance ${ambulance.vehicleNumber} approved`);
    addActivity(`Super Admin approved ambulance ${ambulance.vehicleNumber}`, "Ambulance Verification", "Success", ambulance.hospitalName);
  };

  const rejectPendingAmbulance = async (ambulance, rejectionReason = "") => {
    await verificationService.rejectAmbulance(ambulance.id, rejectionReason);
    setPendingAmbulances((items) =>
      items.map((item) =>
        item.id === ambulance.id
          ? {
              ...item,
              verificationStatus: "rejected",
              rejectionReason,
              editable: true,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    addNotification("ambulance_rejected", ambulance.hospitalId, `Ambulance ${ambulance.vehicleNumber} rejected`);
    addActivity(`Super Admin rejected ambulance ${ambulance.vehicleNumber}`, "Ambulance Verification", "Warning", ambulance.hospitalName);
  };

  const requestAmbulanceResubmission = async (ambulance, rejectionReason = "") => {
    await verificationService.requestAmbulanceResubmission(ambulance.id, rejectionReason);
    setPendingAmbulances((items) =>
      items.map((item) =>
        item.id === ambulance.id
          ? {
              ...item,
              verificationStatus: "resubmission_required",
              rejectionReason,
              editable: true,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    addNotification("resubmission_required", ambulance.hospitalId, `Resubmission requested for ambulance ${ambulance.vehicleNumber}`);
    addActivity(`Super Admin requested resubmission for ambulance ${ambulance.vehicleNumber}`, "Ambulance Verification", "Warning", ambulance.hospitalName);
  };

  const value = useMemo(() => {
    const pendingDriverRequests = pendingDrivers.filter((driver) => driver.verificationStatus === "pending").length;
    const pendingAmbulanceRequests = pendingAmbulances.filter((ambulance) => ambulance.verificationStatus === "pending").length;
    const rejectedRequests =
      pendingDrivers.filter((driver) => driver.verificationStatus === "rejected").length +
      pendingAmbulances.filter((ambulance) => ambulance.verificationStatus === "rejected").length;
    const resubmissionRequests =
      pendingDrivers.filter((driver) => driver.verificationStatus === "resubmission_required").length +
      pendingAmbulances.filter((ambulance) => ambulance.verificationStatus === "resubmission_required").length;

      return {
        overviewStats: [
        {
          label: "Pending Driver Requests",
          value: String(pendingDriverRequests),
          detail: "Stored in pending_drivers",
          trend: pendingDriverRequests ? "needs action" : "clear",
          tone: pendingDriverRequests ? "warning" : "success",
        },
        {
          label: "Pending Ambulance Requests",
          value: String(pendingAmbulanceRequests),
          detail: "Stored in pending_ambulances",
          trend: pendingAmbulanceRequests ? "needs action" : "clear",
          tone: pendingAmbulanceRequests ? "warning" : "success",
        },
        {
          label: "Approved Drivers",
          value: String(drivers.length),
          detail: "Main drivers collection",
          trend: "login enabled",
          tone: "success",
        },
        {
          label: "Active Ambulances",
          value: String(ambulances.filter((ambulance) => ambulance.vehicleActive).length),
          detail: "Main ambulances collection",
          trend: "active fleet",
          tone: "success",
        },
        {
          label: "Rejected Requests",
          value: String(rejectedRequests),
          detail: "Editable by hospital admins",
          trend: resubmissionRequests ? `${resubmissionRequests} resubmissions` : "reviewed",
          tone: rejectedRequests ? "danger" : "success",
          },
        ],
        operationalStats: [
          {
            label: "Active Ambulances",
            value: String(ambulances.filter((ambulance) => ambulance.vehicleActive).length),
            detail: "Verified fleet available",
            trend: "dispatch ready",
            tone: "success",
          },
          {
            label: "Active Hospitals",
            value: String(hospitals.filter((hospital) => hospital.status === "Operational").length),
            detail: `${hospitals.length} hospitals connected`,
            trend: "network online",
            tone: "success",
          },
          {
            label: "Active Emergencies",
            value: String(emergencies.length),
            detail: "Currently tracked incidents",
            trend: "live monitoring",
            tone: emergencies.length ? "warning" : "success",
          },
        ],
        approvalBreakdown: [
        { name: "Approved", value: drivers.length + ambulances.filter((ambulance) => ambulance.vehicleActive).length },
        { name: "Rejected", value: rejectedRequests },
        { name: "Pending", value: pendingDriverRequests + pendingAmbulanceRequests },
        { name: "Resubmission", value: resubmissionRequests },
      ],
      verificationTrend,
      systemPanels,
      hospitals,
      pendingDrivers,
      drivers,
      pendingAmbulances,
      ambulances,
      emergencies,
      activityLogs,
      notifications,
      assignments,
      settings,
      setSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
      hospitalsActions: crud(setHospitals, "HSP"),
      pendingDriversActions: {
        ...crud(setPendingDrivers, "PDRV"),
        approve: approvePendingDriver,
        reject: rejectPendingDriver,
        requestResubmission: requestDriverResubmission,
      },
      pendingAmbulancesActions: {
        ...crud(setPendingAmbulances, "PAMB"),
        approve: approvePendingAmbulance,
        reject: rejectPendingAmbulance,
        requestResubmission: requestAmbulanceResubmission,
      },
      driversActions: crud(setDrivers, "DRV"),
      ambulancesActions: crud(setAmbulances, "AMB"),
      assignmentActions: crud(setAssignments, "ASN"),
    };
  }, [
    hospitals,
    pendingDrivers,
    drivers,
    pendingAmbulances,
    ambulances,
    emergencies,
    activityLogs,
    notifications,
    assignments,
    settings,
  ]);

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const context = useContext(OpsContext);
  if (!context) throw new Error("useOps must be used inside OpsProvider");
  return context;
}
