import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Radio, Search, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePoliceStore } from "@/store/policeStore";

export function Topbar() {
  const setMobileSidebarOpen = usePoliceStore((state) => state.setMobileSidebarOpen);
  const searchQuery = usePoliceStore((state) => state.searchQuery);
  const setSearchQuery = usePoliceStore((state) => state.setSearchQuery);
  const alertCount = usePoliceStore((state) => state.priorityAlerts.length);
  const logout = usePoliceStore((state) => state.logout);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search emergency ID, ambulance, driver, hospital..."
        />
      </div>

      <div className="hidden items-center gap-2 rounded-md border bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 md:flex">
        <Radio className="h-4 w-4" />
        Live connected
      </div>

      <button className="relative flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700">
        <Siren className="h-4 w-4 text-status-critical" />
        <span className="hidden sm:inline">{alertCount} alerts</span>
      </button>

      <Button variant="outline" size="icon" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>

      <div className="relative hidden md:block" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex h-10 items-center gap-3 rounded-md border bg-white px-2 pr-3 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
            PK
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-900">Operator P. Kumar</p>
            <p className="text-[11px] text-slate-500">Police control</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => {
                setProfileOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
