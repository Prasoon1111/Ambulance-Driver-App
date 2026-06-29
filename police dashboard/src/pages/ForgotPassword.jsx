import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Background decorations */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[40%] w-[30%] rounded-full bg-amber-100/40 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                <KeyRound className="h-8 w-8" />
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Reset Passcode</h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your registered badge ID or email to receive reset instructions.
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-slate-200 bg-slate-50 placeholder:text-slate-400 focus-visible:ring-amber-500"
                    placeholder="Badge ID or Email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-amber-500 text-lg font-medium text-white shadow-md transition-all hover:bg-amber-600 hover:shadow-lg"
                >
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
                If an account matches <strong>{email}</strong>, a reset link will be sent shortly. Please check your secure inbox.
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
