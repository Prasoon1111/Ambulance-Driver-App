import {
  Activity,
  AlertTriangle,
  Ambulance,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { usePoliceStore } from "@/store/policeStore";
import { cn } from "@/utils/cn";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Active Emergencies", path: "/emergencies", icon: Ambulance },
  { label: "Live Tracking", path: "/tracking", icon: Map },
  { label: "Priority Alerts", path: "/alerts", icon: AlertTriangle },
  { label: "Activity Feed", path: "/activity", icon: Activity },
  { label: "Settings", path: "/settings", icon: Settings },
];

function SidebarContent({ collapsed = false, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">Police Command</p>
            <p className="truncate text-xs text-slate-500">Emergency coordination</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                isActive && "bg-slate-100 text-primary",
                collapsed && "justify-center px-2",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className={cn("rounded-lg bg-slate-50 p-3", collapsed && "p-2 text-center")}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {!collapsed && <p className="text-xs font-medium text-slate-700">Realtime services online</p>}
          </div>
          {!collapsed && <p className="mt-1 text-xs text-slate-500">Firestore listener-ready architecture</p>}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const collapsed = usePoliceStore((state) => state.sidebarCollapsed);
  const mobileOpen = usePoliceStore((state) => state.mobileSidebarOpen);
  const toggleSidebar = usePoliceStore((state) => state.toggleSidebar);
  const setMobileSidebarOpen = usePoliceStore((state) => state.setMobileSidebarOpen);

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 border-r bg-white transition-all duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="relative h-full">
          <SidebarContent collapsed={collapsed} />
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-5 h-8 w-8 rounded-full bg-white"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="relative h-full w-72 border-r bg-white shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 z-10"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
            <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
