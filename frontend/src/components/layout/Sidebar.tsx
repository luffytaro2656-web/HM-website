import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Hospital, Users, Stethoscope, CalendarDays,
  UserCog, ClipboardCheck, Package, Receipt, BarChart3, Settings,
  LogOut, ChevronLeft, Activity, Pill, FlaskConical, BedDouble, ChevronDown, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { type AppModule } from "@/config/roleConfig";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { ROLE_LABELS } from "@/types/common";
import { HOSPITALS } from "@/mocks/hospitals";

const PATH_TO_MODULE_MAP: Record<string, AppModule> = {
  "/dashboard": "dashboard",
  "/patients": "patients",
  "/doctors": "doctors",
  "/appointments": "appointments",
  "/admissions": "admissions",
  "/pharmacy": "pharmacy",
  "/lab": "lab",
  "/hospitals": "hospitals",
  "/staff": "staff",
  "/inventory": "inventory",
  "/billing": "billing",
  "/reports": "reports",
  "/settings": "settings",
};

const NAV = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Clinical", items: [
    { to: "/patients", label: "Patients", icon: Users, subItems: [
        { to: "/patients", label: "Overview" },
        { to: "/patients/registration", label: "Register Patient" }
      ]
    },
    { to: "/doctors", label: "Doctors", icon: Stethoscope, subItems: [
        { to: "/doctors", label: "Overview" },
        { to: "/doctors/availability", label: "Availability" },
        { to: "/doctors/assignments", label: "Assignments" }
      ]
    },
    { to: "/appointments", label: "Appointments", icon: CalendarDays, subItems: [
        { to: "/appointments", label: "Overview" },
        { to: "/appointments/booking", label: "Book Appointment" }
      ]
    },
    { to: "/admissions", label: "Admissions", icon: BedDouble, subItems: [
        { to: "/admissions", label: "Overview" },
        { to: "/admissions/discharge", label: "Discharge & Billing" }
      ]
    },
    { to: "/pharmacy", label: "Pharmacy", icon: Pill, subItems: [
        { to: "/pharmacy", label: "Medicine Stock" },
        { to: "/pharmacy/dispense", label: "Dispense Medicine" },
        { to: "/pharmacy/purchases", label: "Purchase Orders" }
      ]
    },
    { to: "/lab", label: "Lab Management", icon: FlaskConical, subItems: [
        { to: "/lab", label: "Test Orders" },
        { to: "/lab/samples", label: "Sample Tracking" },
        { to: "/lab/results", label: "Result Upload" }
      ]
    }
  ]},
  { group: "Operations", items: [
    { to: "/hospitals", label: "Hospitals", icon: Hospital, subItems: [
        { to: "/hospitals", label: "Profile" },
        { to: "/hospitals/departments", label: "Departments" },
        { to: "/hospitals/beds", label: "Bed Management" }
      ]
    },
    { to: "/staff", label: "Staff", icon: UserCog, subItems: [
        { to: "/staff", label: "Staff Directory" },
        { to: "/staff/create", label: "Add Staff" },
        { to: "/staff/attendance", label: "Attendance" },
        { to: "/staff/schedule", label: "Shift Schedule" },
        { to: "/staff/leaves", label: "Leave Requests" },
        { to: "/staff/payroll", label: "Payroll Summary" }
      ]
    },
    { to: "/inventory", label: "Inventory", icon: Package, subItems: [
        { to: "/inventory", label: "Supplies Stock" },
        { to: "/inventory/purchases", label: "Purchase Entries" }
      ]
    },
  ]},
  { group: "Finance", items: [
    { to: "/billing", label: "Billing", icon: Receipt, subItems: [
        { to: "/billing", label: "Invoices" },
        { to: "/billing/payments", label: "Payments & Insurance" }
      ]
    },
  ]},
  { group: "Analytics", items: [
    { to: "/reports", label: "Reports", icon: BarChart3 },
  ]},
  { group: "System", items: [
    { to: "/settings", label: "Settings", icon: Settings, subItems: [
        { to: "/settings", label: "System Config" },
        { to: "/settings/users", label: "User Management" },
        { to: "/settings/roles", label: "Role Privileges" },
        { to: "/settings/audit", label: "Audit Logs" }
      ]
    },
  ]},
] as const;

interface SidebarProps {
  forceExpanded?: boolean;
}

export function Sidebar({ forceExpanded = false }: SidebarProps) {
  const storeCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const collapsed = forceExpanded ? false : storeCollapsed;
  const toggle = useUIStore((s) => s.toggleSidebar);
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeHospitalId = useAuthStore((s) => s.activeHospitalId);
  const setActiveHospital = useAuthStore((s) => s.setActiveHospital);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const activeHospital = HOSPITALS.find((h) => h.id === activeHospitalId);
  const { canAccess } = usePermission();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Filter navigation items dynamically according to the user permissions
  const filteredNav = NAV.map((group) => {
    const filteredItems = group.items.filter((item) => {
      const moduleKey = PATH_TO_MODULE_MAP[item.to];
      if (!moduleKey) return true;
      return canAccess(moduleKey, "read");
    });
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  useEffect(() => {
    filteredNav.forEach((group) => {
      group.items.forEach((item) => {
        if ("subItems" in item && Array.isArray(item.subItems)) {
          const hasActiveSub = item.subItems.some((sub) => pathname === sub.to);
          const isParentActive = pathname === item.to || pathname.startsWith(item.to);
          if (hasActiveSub || isParentActive) {
            setExpanded((prev) => ({ ...prev, [item.to]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleExpand = (to: string) => {
    if (collapsed) return;
    setExpanded((prev) => ({ ...prev, [to]: !prev[to] }));
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">HMS</p>
              <p className="truncate text-[11px] text-sidebar-foreground/70">{activeHospital?.name ?? "All Hospitals"}</p>
            </div>
          ) : null}
        </div>
        {!forceExpanded ? (
          <button
            onClick={toggle}
            className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        ) : (
          <button
            onClick={() => setMobileSidebar(false)}
            className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {!collapsed && user?.role === "super_admin" ? (
        <div className="border-b border-sidebar-border p-3">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-sidebar-foreground/60">
            Active Hospital
          </label>
          <select
            value={activeHospitalId}
            onChange={(e) => setActiveHospital(e.target.value)}
            className="w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Hospitals</option>
            {HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {filteredNav.map((group) => (
          <div key={group.group} className="mb-4">
            {!collapsed ? (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group.group}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                const hasSubItems = "subItems" in item && Array.isArray(item.subItems);
                const isExpanded = expanded[item.to];

                return (
                  <li key={item.to} className="space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <Link
                        to={item.to}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary text-white"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                      {!collapsed && hasSubItems ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpand(item.to);
                          }}
                          className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                        >
                          <ChevronDown className={cn("size-3.5 transition-transform duration-200", isExpanded && "rotate-180")} />
                        </button>
                      ) : null}
                    </div>
                    {!collapsed && hasSubItems && isExpanded ? (
                      <ul className="mt-0.5 pl-6 space-y-0.5 border-l border-sidebar-border/30 ml-3">
                        {(item.subItems as any).map((sub: any) => {
                          const subActive = pathname === sub.to;
                          return (
                            <li key={sub.to}>
                              <Link
                                to={sub.to}
                                className={cn(
                                  "block rounded-md px-2.5 py-1.5 text-xs transition-colors",
                                  subActive
                                    ? "bg-sidebar-accent text-white font-medium"
                                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white",
                                )}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-[11px] text-sidebar-foreground/70">{user.backendRole || ROLE_LABELS[user.role]}</p>
              </div>
            ) : null}
            {!collapsed ? (
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
