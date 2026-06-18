import { Bell, Search } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { HOSPITALS } from "@/mocks/hospitals";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/hospitals": "Hospitals",
  "/doctors": "Doctors",
  "/patients": "Patients",
  "/appointments": "Appointments",
  "/staff": "Staff",
  "/staff/attendance": "Attendance",
  "/inventory": "Inventory",
  "/billing": "Billing",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function Header() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const activeHospitalId = useAuthStore((s) => s.activeHospitalId);
  const activeHospital = HOSPITALS.find((h) => h.id === activeHospitalId);

  const title = TITLES[pathname] ?? (pathname.startsWith("/hospitals/") ? "Hospital Details"
    : pathname.startsWith("/patients/") ? "Patient Details"
    : pathname.startsWith("/doctors/") ? "Doctor Profile"
    : pathname.startsWith("/billing/") ? "Invoice"
    : "HMS");

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span>HMS</span> <span className="mx-1">/</span> <span className="text-foreground">{title}</span>
        </p>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search patients, doctors..."
            className="h-9 w-72 rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button className="relative rounded-md border bg-background p-2 hover:bg-muted">
          <Bell className="size-4 text-foreground" />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">3</span>
        </button>
        {activeHospital ? (
          <span className="hidden rounded-full border bg-primary-light px-3 py-1 text-xs font-medium text-primary md:inline">
            {activeHospital.name}
          </span>
        ) : null}
      </div>
    </header>
  );
}
