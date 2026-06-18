import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import { ROLE_LABELS } from "@/types/common";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — HMS" }] }),
  component: SettingsPage,
});

const TABS = ["Profile", "Hospital Config", "User Management", "Notifications", "Security"] as const;

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
});

function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: "admin@hms.in" },
  });

  return (
    <div>
      <PageHeader title="Settings" description="System and account preferences" />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
          )}>{t}</button>
        ))}
      </div>

      {tab === "Profile" ? (
        <div className="max-w-xl rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(() => toast.success("Profile updated"))} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} className="mt-1.5" />
              {errors.name ? <p className="mt-1 text-xs text-danger">{errors.name.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} className="mt-1.5" />
              {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email.message}</p> : null}
            </div>
            <div>
              <Label>Role</Label>
              <p className="mt-1.5 inline-flex items-center rounded-md bg-primary-light px-3 py-1.5 text-sm font-medium text-primary">{user ? ROLE_LABELS[user.role] : "—"}</p>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </div>
      ) : null}

      {tab === "Notifications" ? (
        <div className="max-w-xl rounded-lg border bg-card p-6 shadow-sm">
          {[
            { label: "Low stock email alerts", desc: "Daily summary when inventory drops below reorder level" },
            { label: "Appointment reminders", desc: "Send SMS reminders to patients 24h before" },
            { label: "Attendance anomalies", desc: "Notify HR when staff is absent or late" },
            { label: "Critical patient alerts", desc: "Push notifications for emergency admissions" },
          ].map((item, i) => (
            <div key={item.label} className={cn("flex items-center justify-between py-4", i > 0 && "border-t")}>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={i % 2 === 0} />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Hospital Config" ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Hospital-level configuration — coming soon.</div>
      ) : null}
      {tab === "User Management" ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">System user roster — coming soon.</div>
      ) : null}
      {tab === "Security" ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">2FA, session management — coming soon.</div>
      ) : null}
    </div>
  );
}
