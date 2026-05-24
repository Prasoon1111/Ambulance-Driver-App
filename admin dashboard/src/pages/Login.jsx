import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleSubmit(event) {
    event.preventDefault();
    login();
    navigate("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="hidden border-r border-slate-200 bg-white p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">RX</div>
              <div>
                <p className="text-sm font-semibold text-slate-950">ResQOps</p>
                <p className="text-xs text-slate-500">Emergency Ambulance Coordination SaaS</p>
              </div>
            </div>
            <div className="mt-24 max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Super admin operations console</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Company-owned control panel for hospitals, drivers, ambulances, active emergencies, roles, and platform health.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              Demo access is local-only and ready for Firebase Auth wiring.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">RX</div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">ResQOps</p>
                  <p className="text-xs text-slate-500">Secure admin console</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use demo credentials to enter the super admin panel.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <span className="mt-2 flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-white px-3">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    defaultValue="admin@resqops.com"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="admin@resqops.com"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <span className="mt-2 flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-white px-3">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type="password"
                    defaultValue="resqops-admin"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Enter password"
                  />
                </span>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                />
                Remember session
              </label>
              <button type="button" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                Need support?
              </button>
            </div>

            <Button type="submit" className="mt-8 h-11 w-full">
              Enter Dashboard
              <ArrowRight size={18} />
            </Button>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              Demo-only login. No authentication or backend validation is connected.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
