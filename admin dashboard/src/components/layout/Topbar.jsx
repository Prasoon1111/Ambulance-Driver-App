import { Bell, ChevronDown, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useOps } from "../../context/OpsContext.jsx";
import Button from "../ui/Button.jsx";
import { MobileMenuButton } from "./Sidebar.jsx";

export default function Topbar({ onMenuClick }) {
  const { logout } = useAuth();
  const { settings } = useOps();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <MobileMenuButton onClick={onMenuClick} />

      <div className="relative hidden min-w-0 flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="focus-ring h-9 w-full max-w-xl rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
          placeholder="Search hospitals, drivers, emergencies..."
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Systems operational
        </div>
        <Button variant="secondary" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="group relative">
          <Button variant="secondary" className="gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-xs text-white">NP</span>
            <span className="hidden text-sm sm:inline">{settings.adminName}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </Button>
          <div className="invisible absolute right-0 top-11 w-56 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-950">{settings.adminName}</p>
              <p className="text-xs text-slate-500">{settings.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
