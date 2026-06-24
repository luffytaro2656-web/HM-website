import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { LoginForm, type LoginFormValues } from "@/components/modules/auth/LoginForm";
import { loginRequest } from "@/lib/api/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — HMS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await loginRequest(data.email, data.password);
      login(response.user, response.accessToken);
      toast.success(`Welcome, ${response.user.name}`);
      await navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Branding Panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary">
            <Activity className="size-5" />
          </div>
          <span className="text-lg font-semibold">HMS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Centralized care.<br />Unified control.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Manage 20 hospitals, thousands of patients, and clinical operations from one secure, real-time platform.
          </p>
        </div>
        <p className="text-xs text-white/40">© 2026 HMS Health Systems</p>
      </div>

      {/* Right Auth Forms Panel */}
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Sign in to HMS</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your credentials to access the system.
            </p>
          </div>
          <LoginForm
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            onToggleForm={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
