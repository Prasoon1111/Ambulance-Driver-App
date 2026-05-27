import ActiveEmergenciesPanel from "../../components/dashboard/ActiveEmergenciesPanel.jsx";
import ActivityFeed from "../../components/dashboard/ActivityFeed.jsx";
import AmbulanceMonitoring from "../../components/dashboard/AmbulanceMonitoring.jsx";
import OperationalStatus from "../../components/dashboard/OperationalStatus.jsx";
import OverviewCards from "../../components/dashboard/OverviewCards.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useOps } from "../../context/OpsContext.jsx";

export default function Dashboard() {
  const { overviewStats, operationalStats, emergencies, activityLogs, systemPanels, ambulances } = useOps();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        description="Global emergency coordination overview for hospitals, drivers, ambulances, and platform health."
      />
      <OverviewCards stats={overviewStats} />
      <OverviewCards stats={operationalStats} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <div className="space-y-6">
          <ActiveEmergenciesPanel emergencies={emergencies} />
          <OperationalStatus panels={systemPanels} />
        </div>
        <div className="space-y-6">
          <ActivityFeed logs={activityLogs} />
          <AmbulanceMonitoring ambulances={ambulances} />
        </div>
      </div>
    </div>
  );
}
