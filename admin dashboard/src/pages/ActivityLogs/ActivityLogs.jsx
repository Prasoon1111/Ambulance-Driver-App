
import ActivityLogsTable from "../../components/activity/ActivityLogsTable.jsx";
import Input from "../../components/ui/Input.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { matchesSearch } from "../../utils/formatters.js";

import { useEffect, useMemo, useState } from "react";

import { listenToActivityLogs }
from "../../services/firestore/activityLogService";

export default function ActivityLogs() {

  const [activityLogs, setActivityLogs] = useState([]);

  const [query, setQuery] = useState("");

  const [category, setCategory] =
    useState("All categories");

  useEffect(() => {

    let unsubscribe;

    async function setup() {
      unsubscribe =
        await listenToActivityLogs(
          setActivityLogs
        );
    }

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };

  }, []);

  const categories = [
    "All categories",
    ...Array.from(
      new Set(
        activityLogs.map(
          (item) => item.category
        )
      )
    ),
  ];

  const rows = useMemo(
    () => activityLogs.filter((log) => (category === "All categories" || log.category === category) && matchesSearch(log, query, ["actor", "event", "region", "status"])),
    [activityLogs, query, category],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Activity Logs" description="Audit-friendly stream of platform operations, routing decisions, and admin changes." />
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
        <Input placeholder="Search logs..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="sm:w-52" value={category} onChange={(event) => setCategory(event.target.value)} options={categories} />
      </div>
      <ActivityLogsTable rows={rows} />
    </div>
  );
}
