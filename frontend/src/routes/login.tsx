import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { HOSPITALS } from "@/mocks/hospitals";
import { ROLE_LABELS, type Role } from "@/types/common";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.enum(["super_admin", "hospital_admin", "doctor", "nurse", "staff", "patient"]),
  hospitalId: z.string().min(1, "Select a hospital"),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — HMS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "Dr. Arjun Iyer", role: "super_admin", hospitalId: HOSPITALS[0].id },
  });

  const onSubmit = async (data: FormValues) => {
    login({ name: data.name, role: data.role, hospitalId: data.hospitalId });
    toast.success(`Welcome, ${data.name}`);
    await navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary"><Activity className="size-5" /></div>
          <span className="text-lg font-semibold">HMS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Centralized care.<br />Unified control.</h1>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Manage 20 hospitals, thousands of patients, and clinical operations from one
            secure, real-time platform.
          </p>
        </div>
        <p className="text-xs text-white/40">© 2026 HMS Health Systems</p>
      </div>
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Sign in to HMS</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select your role to enter the system.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...register("name")} className="mt-1.5" />
              {errors.name ? <p className="mt-1 text-xs text-danger">{errors.name.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="hospitalId">Hospital</Label>
              <select id="hospitalId" {...register("hospitalId")} className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm">
                {HOSPITALS.map((h) => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" {...register("role")} className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm">
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Access System
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo mode — no password required.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
