import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    badgeId: "",
    email: "",
    department: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API registration request
    alert("System access request submitted successfully. Waiting for admin approval.");
    navigate("/login");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-emerald-100/50 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[40%] w-[30%] rounded-full bg-blue-100/40 blur-[100px]" />
      </div>

      <div className="relative z-10 my-8 w-full max-w-md px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <UserPlus className="h-8 w-8" />
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Request Access</h1>
              <p className="mt-2 text-sm text-slate-500">
                Submit your details for Police Command verification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
              />
              <Input
                type="text"
                placeholder="Badge ID"
                required
                value={formData.badgeId}
                onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
                className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
              />
              <Input
                type="email"
                placeholder="Official Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
              />
              <Input
                type="text"
                placeholder="Department / Unit"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
              />

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-emerald-600 text-lg font-medium text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
              >
                Submit Request
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
