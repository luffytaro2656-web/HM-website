import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { hasRolePermission } from "@/config/roleConfig";
import { PageHeader } from "@/components/common/PageHeader";
import { UserManagementTab } from "@/components/modules/users/UserManagementTab";

export const Route = createFileRoute("/_app/settings/users")({
  head: () => ({ meta: [{ title: "User Account Provisioning — HMS" }] }),
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    const activeRole = user?.backendRole || user?.role;
    if (!hasRolePermission(activeRole, "settings", "read")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SettingsUsersPage,
});

function SettingsUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Account Provisioning"
        description="Manage security roles, personnel login access, and pending administrator requests."
      />
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <UserManagementTab />
      </div>
    </div>
  );
}
