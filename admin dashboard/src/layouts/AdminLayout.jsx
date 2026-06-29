import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import { OpsProvider } from "../context/OpsContext.jsx";
import { cn } from "../utils/cn.js";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <OpsProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
        <div className={cn("min-w-0 transition-all lg:pl-72", collapsed && "lg:pl-20")}>
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </OpsProvider>
  );
}
