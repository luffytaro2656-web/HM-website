import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
  type SystemRole, 
  type AppModule, 
  type PermissionAction,
  ROLE_PERMISSIONS 
} from "@/config/roleConfig";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Shield, Users, Activity, Stethoscope, BedDouble, 
  Pill, FlaskConical, Receipt, BarChart3, Settings, 
  UserCog, ClipboardCheck, Package, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePermissionRequest, resetPermissionsRequest } from "@/lib/api/permissions";

const ROLE_ICONS: Record<SystemRole, any> = {
  "Super Admin": Shield,
  "Hospital Admin": UserCog,
  "Hospital Manager": ClipboardCheck,
  "Doctor": Stethoscope,
  "Nurse": Activity,
  "Receptionist": Users,
  "Billing Executive": Receipt,
  "Pharmacy Staff": Pill,
  "Lab Technician": FlaskConical,
  "Patient": Users,
};

const MODULE_DETAILS: Record<AppModule, { label: string; icon: any; desc: string; actions: PermissionAction[] }> = {
  dashboard: { label: "Dashboard", icon: Activity, desc: "Main metrics, KPIs, and clinic summaries", actions: ["read", "export"] },
  hospitals: { label: "Hospital Management", icon: Shield, desc: "Onboard, edit, and audit hospital branches", actions: ["create", "read", "update", "delete"] },
  staff: { label: "Staff Management", icon: UserCog, desc: "HR, directory, shifts, and payroll records", actions: ["create", "read", "update", "delete"] },
  doctors: { label: "Doctor Directory", icon: Stethoscope, desc: "Physician availabilities, clinic schedules, and department assignments", actions: ["create", "read", "update", "delete"] },
  patients: { label: "Patient Records", icon: Users, desc: "Patient roster, intake registration, and medical records", actions: ["create", "read", "update", "delete"] },
  appointments: { label: "Appointment Desk", icon: ClipboardCheck, desc: "Book, reschedule, or cancel patient appointments", actions: ["create", "read", "update", "delete"] },
  admissions: { label: "Admissions & Beds", icon: BedDouble, desc: "Admit patients, allocate beds, and schedule discharges", actions: ["create", "read", "update", "delete", "trigger"] },
  pharmacy: { label: "Pharmacy Stock", icon: Pill, desc: "Dispense prescriptions and track medicine inventory", actions: ["create", "read", "update", "delete"] },
  inventory: { label: "Supplies Inventory", icon: Package, desc: "Clinic assets, medical supplies, and purchase logs", actions: ["create", "read", "update", "delete"] },
  lab: { label: "Laboratory Center", icon: FlaskConical, desc: "Order lab panels, track blood samples, and upload results", actions: ["create", "read", "update", "delete"] },
  billing: { label: "Billing & Invoicing", icon: Receipt, desc: "Patient payments, insurance processing, and invoice generation", actions: ["create", "read", "update", "delete", "export", "trigger"] },
  attendance: { label: "Attendance Tracker", icon: ClipboardCheck, desc: "Clock-in sheets, leave balances, and shift compliance", actions: ["create", "read", "update", "delete"] },
  reports: { label: "Reports & Audits", icon: BarChart3, desc: "Financial ledger, clinic metrics, and PDF exports", actions: ["read", "export"] },
  notifications: { label: "Alert Dispatch", icon: Shield, desc: "Manage system notifications and broad SMS channels", actions: ["read"] },
  settings: { label: "Settings Portal", icon: Settings, desc: "System configuration, user accounts, and security preferences", actions: ["create", "read", "update", "delete"] },
};

const ACTION_LABELS: Record<PermissionAction, string> = {
  create: "Create / Onboard",
  read: "View / Access",
  update: "Edit / Update",
  delete: "Delete / Suspend",
  approve: "Approve Requests",
  trigger: "Trigger Action",
  export: "Export Reports",
};

export function RolePrivilegesTab() {
  const permissions = useAuthStore((s) => s.permissions);
  const updatePermission = useAuthStore((s) => s.updatePermission);
  const resetPermissions = useAuthStore((s) => s.resetPermissions);
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);

  const handleToggle = async (role: SystemRole, module: AppModule, action: PermissionAction, enabled: boolean) => {
    // Optimistic UI state update
    updatePermission(role, module, action, enabled);

    try {
      await updatePermissionRequest(role, module, action, enabled);
      toast.success(`${ACTION_LABELS[action]} permission for ${role} on ${MODULE_DETAILS[module].label} has been ${enabled ? "enabled" : "disabled"}.`);
    } catch (error: any) {
      // Revert change on backend error
      updatePermission(role, module, action, !enabled);
      toast.error(error.message || "Failed to sync permission change with the server.");
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all role permissions to system defaults?")) {
      try {
        await resetPermissionsRequest();
        resetPermissions();
        toast.success("All privileges have been reset to system defaults.");
      } catch (error: any) {
        toast.error(error.message || "Failed to reset privileges on the server.");
      }
    }
  };

  const rolesList = Object.keys(ROLE_PERMISSIONS) as SystemRole[];
  const SelectedIcon = selectedRole ? ROLE_ICONS[selectedRole] || Shield : Shield;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Role Privileges & Access Matrix</h2>
          <p className="text-xs text-muted-foreground">Select a role to configure modular capabilities, access scopes, and feature actions dynamically.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1.5 text-xs">
          <RotateCcw className="size-3.5" />
          Reset Defaults
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {rolesList.map((role) => {
          const Icon = ROLE_ICONS[role] || Shield;
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(isSelected ? null : role)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              <div className={cn(
                "mb-2.5 flex size-10 items-center justify-center rounded-lg transition-colors",
                isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="size-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{role}</span>
            </button>
          );
        })}
      </div>

      {selectedRole && (
        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SelectedIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{selectedRole} Access Dashboard</h3>
              <p className="text-xs text-muted-foreground">Enable or disable access parameters for individual modules.</p>
            </div>
          </div>

          <div className="space-y-4">
            {(Object.keys(MODULE_DETAILS) as AppModule[]).map((moduleKey) => {
              const moduleInfo = MODULE_DETAILS[moduleKey];
              const MIcon = moduleInfo.icon;
              const rule = permissions[selectedRole]?.[moduleKey] || { access: "None", actions: [] };
              const hasModuleAccess = rule.access !== "None";

              return (
                <div key={moduleKey} className="rounded-lg border bg-background/50 p-4 transition-colors hover:bg-background/80">
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <MIcon className="size-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{moduleInfo.label}</span>
                        <p className="text-[11px] text-muted-foreground">{moduleInfo.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {rule.access === "None" ? "Blocked" : `${rule.access} Access`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 sm:grid-cols-3 md:grid-cols-4">
                    {moduleInfo.actions.map((action) => {
                      const isGranted = rule.actions.includes(action);
                      return (
                        <div key={action} className="flex items-center justify-between py-1">
                          <span className="text-xs text-muted-foreground">{ACTION_LABELS[action]}</span>
                          <Switch
                            checked={isGranted}
                            onCheckedChange={(checked) => handleToggle(selectedRole, moduleKey, action, checked)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
