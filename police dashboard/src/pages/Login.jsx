import { useState } from "react";
import { ArrowRight, Lock, ShieldCheck, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePoliceStore } from "@/store/policeStore";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = usePoliceStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate authentication API call
    setTimeout(() => {
      login();
      navigate("/");
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Background decorations for a sleek, light-themed smart-city vibe */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[40%] w-[30%] rounded-full bg-emerald-100/40 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Police Command</h1>
              <p className="mt-2 text-sm text-slate-500">Secure access to central monitoring</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-slate-200 bg-slate-50 pl-10 placeholder:text-slate-400 focus-visible:ring-primary"
                    placeholder="Badge ID or Email"
                    required
                  />
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-slate-200 bg-slate-50 pl-10 placeholder:text-slate-400 focus-visible:ring-primary"
                    placeholder="Passcode"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot passcode?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl text-lg font-medium shadow-md transition-all hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span className="flex items-center gap-2">
                    Authorize Access <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
            <p className="text-sm text-slate-600">
              New operator?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Request system access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
