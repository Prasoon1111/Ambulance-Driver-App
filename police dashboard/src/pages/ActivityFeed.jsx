import { ActivityItem } from "@/components/activity/ActivityItem";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoliceStore } from "@/store/policeStore";

export function ActivityFeedPage() {
  const activityFeed = usePoliceStore((state) => state.activityFeed);

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operational events</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Activity Feed</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Realtime Operational Feed</CardTitle>
          <span className="text-xs text-slate-500">{activityFeed.length} recent events</span>
        </CardHeader>
        <div className="divide-y">
          {activityFeed.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      </Card>
    </div>
  );
}
