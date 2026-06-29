import {
  Activity,
  Ambulance,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn.js";
import Button from "../ui/Button.jsx";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Verification Center",
    icon: CheckSquare,
    children: [
      { label: "Pending Drivers", to: "/admin/verification/pending-drivers" },
      { label: "Pending Ambulances", to: "/admin/verification/pending-ambulances" },
      { label: "Rejected Requests", to: "/admin/verification/rejected-requests" },
    ],
  },
  { label: "Hospitals", to: "/admin/hospitals", icon: Building2 },
  { label: "Drivers", to: "/admin/drivers", icon: UsersRound },
  { label: "Ambulances", to: "/admin/ambulances", icon: Ambulance },
  { label: "Active Emergencies", to: "/admin/emergencies", icon: Activity },
  { label: "Activity Logs", to: "/admin/activity-logs", icon: ClipboardList },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }) {
  const body = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">
            RX
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">ResQOps</p>
              <p className="truncate text-xs text-slate-500">Super Admin Panel</p>
            </div>
          )}
        </div>
        <Button className="lg:hidden" variant="ghost" size="icon" onClick={onCloseMobile} aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          item.children ? (
            <div key={item.label} className="space-y-1">
              <div
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed &&
                item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        "ml-7 flex h-8 items-center rounded-md px-3 text-sm font-medium transition",
                        isActive
                          ? "bg-slate-950 text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  collapsed && "justify-center px-0",
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        ))}
      </nav>

      <div className="hidden border-t border-slate-100 p-3 lg:block">
        <Button
          variant="ghost"
          className={cn("w-full", collapsed ? "px-0" : "justify-start")}
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && "Collapse sidebar"}
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{body}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/30" aria-label="Close sidebar" onClick={onCloseMobile} />
          <div className="relative h-full">{body}</div>
        </div>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick} aria-label="Open sidebar">
      <Menu className="h-5 w-5" />
    </Button>
  );
}
