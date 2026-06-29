import { useMemo } from "react";

import { usePoliceStore } from "@/store/policeStore";

export function useFilteredEmergencies() {
  const emergencies = usePoliceStore((state) => state.emergencies);
  const searchQuery = usePoliceStore((state) => state.searchQuery);

  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return emergencies;

    return emergencies.filter((emergency) =>
      [
        emergency.id,
        emergency.type,
        emergency.driverName,
        emergency.ambulanceNumber,
        emergency.severity,
        emergency.destinationHospital,
        emergency.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [emergencies, searchQuery]);
}
