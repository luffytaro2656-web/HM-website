import pool from '../config/db.js';

// System Default Role Permissions Fallback
const DEFAULT_PERMISSIONS = {
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
    patients: { access: "Limited", actions: ["read", "update"] },
    appointments: { access: "Limited", actions: ["read", "update"] },
    admissions: { access: "View", actions: ["read"] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "Limited", actions: ["create", "read"] },
    billing: { access: "None", actions: [] },
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "Limited", actions: ["read"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Nurse": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "View", actions: ["read", "update"] },
    appointments: { access: "View", actions: ["read"] },
    admissions: { access: "Limited", actions: ["read", "update"] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "View", actions: ["read"] },
    billing: { access: "None", actions: [] },
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "None", actions: [] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Receptionist": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["create", "read", "update"] },
    appointments: { access: "Full", actions: ["create", "read", "update", "delete"] },
    admissions: { access: "Trigger", actions: ["create", "read"] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "None", actions: [] },
    billing: { access: "Trigger", actions: ["create"] },
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
    patients: { access: "Limited", actions: ["read"] },
    appointments: { access: "None", actions: [] },
    admissions: { access: "View", actions: ["read"] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "None", actions: [] },
    billing: { access: "Full", actions: ["create", "read", "update", "delete", "export"] },
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "Limited", actions: ["read", "export"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Pharmacy Staff": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["read"] },
    appointments: { access: "None", actions: [] },
    admissions: { access: "None", actions: [] },
    pharmacy: { access: "Full", actions: ["create", "read", "update", "delete"] },
    inventory: { access: "None", actions: [] },
    lab: { access: "None", actions: [] },
    billing: { access: "Trigger", actions: ["create"] },
    attendance: { access: "Limited", actions: ["read", "create"] },
    reports: { access: "Limited", actions: ["read", "export"] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
  "Lab Technician": {
    dashboard: { access: "Limited", actions: ["read"] },
    hospitals: { access: "None", actions: [] },
    staff: { access: "None", actions: [] },
    doctors: { access: "None", actions: [] },
    patients: { access: "Limited", actions: ["read"] },
    appointments: { access: "None", actions: [] },
    admissions: { access: "None", actions: [] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "Full", actions: ["create", "read", "update", "delete"] },
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
    patients: { access: "Limited", actions: ["read"] },
    appointments: { access: "Limited", actions: ["create", "read", "delete"] },
    admissions: { access: "None", actions: [] },
    pharmacy: { access: "None", actions: [] },
    inventory: { access: "None", actions: [] },
    lab: { access: "View", actions: ["read"] },
    billing: { access: "View", actions: ["read"] },
    attendance: { access: "None", actions: [] },
    reports: { access: "None", actions: [] },
    notifications: { access: "Scoped", actions: ["read"] },
    settings: { access: "None", actions: [] },
  },
};

// 1. Get entire merged permissions matrix
export const getPermissions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT role, module, action, enabled FROM role_permissions');
    
    // Deep clone defaults
    const permissions = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));

    // Overwrite with DB modifications
    for (const row of rows) {
      const { role, module, action, enabled } = row;
      if (!permissions[role]) continue;
      if (!permissions[role][module]) {
        permissions[role][module] = { access: "None", actions: [] };
      }

      const moduleRule = permissions[role][module];
      let actions = moduleRule.actions || [];

      // Convert 1/0 DB value to boolean comparison
      const isEnabled = !!enabled;

      if (isEnabled) {
        if (!actions.includes(action)) {
          actions.push(action);
        }
      } else {
        actions = actions.filter(a => a !== action);
      }

      const accessLevel = actions.length > 0 ? (moduleRule.access === "None" ? "View" : moduleRule.access) : "None";

      permissions[role][module] = {
        access: accessLevel,
        actions: actions
      };
    }

    return res.json(permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. Insert or update single capability toggle
export const updatePermission = async (req, res) => {
  try {
    const { role, module, action, enabled } = req.body;

    if (!role || !module || !action || enabled === undefined) {
      return res.status(400).json({ message: 'Role, module, action, and enabled parameters are required.' });
    }

    const enabledVal = enabled ? 1 : 0;

    await pool.query(
      `INSERT INTO role_permissions (role, module, action, enabled)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = ?`,
      [role, module, action, enabledVal, enabledVal]
    );

    return res.json({ message: 'Permission updated successfully.' });
  } catch (error) {
    console.error('Error updating role permission:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 3. Clear all custom parameters (reset to source-of-truth default config)
export const resetPermissions = async (req, res) => {
  try {
    await pool.query('DELETE FROM role_permissions');
    return res.json({ message: 'Permissions reset to defaults successfully.' });
  } catch (error) {
    console.error('Error resetting permissions:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
