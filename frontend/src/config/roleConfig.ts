// Single Source of Truth for Role Permissions Config

export type SystemRole =
  | "Super Admin"
  | "Hospital Admin"
  | "Hospital Manager"
  | "Doctor"
  | "Nurse"
  | "Receptionist"
  | "Billing Executive"
  | "Pharmacy Staff"
  | "Lab Technician"
  | "Patient";

export type AppModule =
  | "dashboard"
  | "hospitals"
  | "staff"
  | "doctors"
  | "patients"
  | "appointments"
  | "admissions"
  | "pharmacy"
  | "inventory"
  | "lab"
  | "billing"
  | "attendance"
  | "reports"
  | "notifications"
  | "settings";

export type AccessLevel = "Full" | "Scoped" | "View" | "Limited" | "Trigger" | "None";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "trigger" | "export";

export interface PermissionRule {
  access: AccessLevel;
  actions: PermissionAction[];
}

export const ROLE_PERMISSIONS: Record<SystemRole, Partial<Record<AppModule, PermissionRule>>> = {
  "Super Admin": {
    dashboard: { access: "Full", actions: ["read", "export"] },
    hospitals: { access: "Full", actions: ["create", "read", "update", "delete"] },
    staff: { access: "Full", actions: ["create", "read", "update", "delete"] },
    doctors: { access: "Full", actions: ["create", "read", "update", "delete"] },
    patients: { access: "Full", actions: ["create", "read", "update", "delete"] },
    appointments: { access: "Full", actions: ["create", "read", "update", "delete"] },
    admissions: { access: "Full", actions: ["create", "read", "update", "delete"] },
    pharmacy: { access: "Full", actions: ["create", "read", "update", "delete"] },
    inventory: { access: "Full", actions: ["create", "read", "update", "delete"] },
    lab: { access: "Full", actions: ["create", "read", "update", "delete"] },
    billing: { access: "Full", actions: ["create", "read", "update", "delete", "export"] },
    attendance: { access: "Full", actions: ["create", "read", "update", "delete"] },
    reports: { access: "Full", actions: ["read", "export"] },
    notifications: { access: "Full", actions: ["read"] },
    settings: { access: "Full", actions: ["create", "read", "update", "delete"] },
  },
  "Hospital Admin": {
    dashboard: { access: "Scoped", actions: ["read"] },
    hospitals: { access: "Scoped", actions: ["read", "update"] },
    staff: { access: "Scoped", actions: ["create", "read", "update", "delete"] },
    doctors: { access: "Scoped", actions: ["create", "read", "update", "delete"] },
    patients: { access: "Full", actions: ["create", "read", "update", "delete"] },
    appointments: { access: "Full", actions: ["create", "read", "update", "delete"] },
    admissions: { access: "Full", actions: ["create", "read", "update", "delete"] },
    pharmacy: { access: "Full", actions: ["create", "read", "update", "delete"] },
    inventory: { access: "Full", actions: ["create", "read", "update", "delete"] },
    lab: { access: "Full", actions: ["create", "read", "update", "delete"] },
    billing: { access: "Full", actions: ["create", "read", "update", "delete", "export"] },
    attendance: { access: "Full", actions: ["create", "read", "update", "delete"] },
    reports: { access: "Scoped", actions: ["read", "export"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "Limited", actions: ["read", "update"] },
  },
  "Hospital Manager": {
    dashboard: { access: "Scoped", actions: ["read"] },
    hospitals: { access: "View", actions: ["read"] },
    staff: { access: "View", actions: ["read"] },
    doctors: { access: "View", actions: ["read"] },
    patients: { access: "View", actions: ["read"] },
    appointments: { access: "View", actions: ["read"] },
    admissions: { access: "View", actions: ["read"] },
    pharmacy: { access: "View", actions: ["read"] },
    inventory: { access: "View", actions: ["read"] },
    lab: { access: "View", actions: ["read"] },
    billing: { access: "View", actions: ["read"] },
    attendance: { access: "View", actions: ["read"] },
    reports: { access: "Scoped", actions: ["read", "export"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Doctor": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "Limited", actions: ["read", "update"] },
    patients: { access: "Limited", actions: ["read", "update"] }, // consultation & prescriptions
    appointments: { access: "Limited", actions: ["read", "update"] }, // own schedule calendar
    admissions: { access: "View", actions: ["read"] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "Limited", actions: ["create", "read"] }, // test orders
    billing: { access: "None", actions: [] },
    attendance: { access: "Limited", actions: ["read", "create"] }, // own leave requests
    reports: { access: "Limited", actions: ["read"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Nurse": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "View", actions: ["read", "update"] }, // update vitals, nursing notes
    appointments: { access: "View", actions: ["read"] },
    admissions: { access: "Limited", actions: ["read", "update"] }, // ward beds occupied/vacant notes
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "View", actions: ["read"] },
    billing: { access: "None", actions: [] },
    attendance: { access: "Limited", actions: ["read", "create"] }, // own leave requests
    reports: { access: "None", actions: [] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Receptionist": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["create", "read", "update"] }, // register/edit demographics
    appointments: { access: "Full", actions: ["create", "read", "update", "delete"] }, // book/reschedule
    admissions: { access: "Trigger", actions: ["create", "read"] }, // initiate admission/discharge
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "None", actions: [] },
    billing: { access: "Trigger", actions: ["create"] }, // triggers billing discharge
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "None", actions: [] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Billing Executive": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["read"] }, // demographics lookup only
    appointments: { access: "None", actions: [] },
    admissions: { access: "View", actions: ["read"] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "None", actions: [] },
    billing: { access: "Full", actions: ["create", "read", "update", "delete", "export"] }, // invoices/receipts
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "Limited", actions: ["read", "export"] }, // collection & outstanding reports
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Pharmacy Staff": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["read"] }, // prescription link demographics
    appointments: { access: "None", actions: [] },
    admissions: { access: "None", actions: [] },
    pharmacy: { access: "Full", actions: ["create", "read", "update", "delete"] }, // dispense/stock
    inventory: { access: "None", actions: [] },
    lab: { access: "None", actions: [] },
    billing: { access: "Trigger", actions: ["create"] }, // pushes invoice line items
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "Limited", actions: ["read", "export"] }, // consumption reports
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Lab Technician": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["read"] }, // patient lookup for test
    appointments: { access: "None", actions: [] },
    admissions: { access: "None", actions: [] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "Full", actions: ["create", "read", "update", "delete"] }, // upload/release result
    billing: { access: "None", actions: [] },
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "Limited", actions: ["read", "export"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Patient": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["read"] }, // own demographics
    appointments: { access: "Limited", actions: ["create", "read", "delete"] }, // book/reschedule own
    admissions: { access: "None", actions: [] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "View", actions: ["read"] }, // download own released results
    billing: { access: "View", actions: ["read"] }, // download own invoices
    attendance: { access: "None", actions: [] },
    reports: { access: "None", actions: [] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
};

// Check helper function to verify if a role has access to a specific module and action
export function hasRolePermission(
  roleName: string | undefined,
  module: AppModule,
  action?: PermissionAction
): boolean {
  if (!roleName) return false;
  const normalizedRoleName = roleName.toLowerCase().replace(/_/g, " ");
  
  // Cast or find matching SystemRole key (case insensitive / space and underscore tolerant check)
  const matchedRole = Object.keys(ROLE_PERMISSIONS).find(
    (key) => key.toLowerCase().replace(/_/g, " ") === normalizedRoleName
  ) as SystemRole | undefined;

  if (!matchedRole) return false;

  const rule = ROLE_PERMISSIONS[matchedRole][module];
  if (!rule || rule.access === "None") return false;

  if (action && !rule.actions.includes(action)) return false;

  return true;
}
