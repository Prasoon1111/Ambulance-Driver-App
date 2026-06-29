import { Save } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { useOps } from "../../context/OpsContext.jsx";

export default function Settings() {
  const { settings, setSettings } = useOps();
  const [draft, setDraft] = useState(settings);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Admin profile, alerting preferences, and platform behavior for the super admin console."
        actions={<Button onClick={() => setSettings(draft)}><Save className="h-4 w-4" />Save settings</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
            <CardDescription>Profile metadata used across audit trails and administrative actions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={draft.adminName} onChange={(event) => update("adminName", event.target.value)} />
            <Input label="Email" value={draft.email} onChange={(event) => update("email", event.target.value)} />
            <Select label="Role" value={draft.role} onChange={(event) => update("role", event.target.value)} options={["Super Admin", "Operations Admin", "Support Admin", "Read-only Auditor"]} />
            <Select label="Timezone" value={draft.timezone} onChange={(event) => update("timezone", event.target.value)} options={["Asia/Calcutta", "UTC", "America/New_York", "Europe/London"]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Console-level defaults for monitoring workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3 text-sm">
              <span>
                <span className="font-medium text-slate-950">Notifications</span>
                <span className="block text-xs text-slate-500">Alert on dispatch and feed events.</span>
              </span>
              <input type="checkbox" className="h-4 w-4 accent-slate-950" checked={draft.notifications} onChange={(event) => update("notifications", event.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3 text-sm">
              <span>
                <span className="font-medium text-slate-950">Critical only</span>
                <span className="block text-xs text-slate-500">Reduce alerts to severe incidents.</span>
              </span>
              <input type="checkbox" className="h-4 w-4 accent-slate-950" checked={draft.criticalOnly} onChange={(event) => update("criticalOnly", event.target.checked)} />
            </label>
            <Select label="Dispatch mode" value={draft.dispatchMode} onChange={(event) => update("dispatchMode", event.target.value)} options={["Balanced", "Fastest ETA", "Hospital Capacity First"]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
