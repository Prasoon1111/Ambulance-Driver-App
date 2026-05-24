import { createContext, useContext, useMemo, useState } from "react";
import {
  initialActivityLogs,
  initialAmbulances,
  initialDrivers,
  initialEmergencies,
  initialHospitals,
  overviewStats,
  systemPanels,
} from "../services/mockData.js";

const OpsContext = createContext(null);

function nextId(prefix, items) {
  const number = items.length + Math.floor(100 + Math.random() * 800);
  return `${prefix}-${number}`;
}

export function OpsProvider({ children }) {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [ambulances, setAmbulances] = useState(initialAmbulances);
  const [emergencies] = useState(initialEmergencies);
  const [activityLogs] = useState(initialActivityLogs);
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
      setter((items) => [{ ...record, id: record.id || nextId(prefix, items) }, ...items]);
    },
    update(id, patch) {
      setter((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    },
    remove(id) {
      setter((items) => items.filter((item) => item.id !== id));
    },
  });

  const value = useMemo(
    () => ({
      overviewStats,
      systemPanels,
      hospitals,
      drivers,
      ambulances,
      emergencies,
      activityLogs,
      settings,
      setSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
      hospitalsActions: crud(setHospitals, "HSP"),
      driversActions: crud(setDrivers, "DRV"),
      ambulancesActions: crud(setAmbulances, "AMB"),
    }),
    [hospitals, drivers, ambulances, emergencies, activityLogs, settings],
  );

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const context = useContext(OpsContext);
  if (!context) throw new Error("useOps must be used inside OpsProvider");
  return context;
}
