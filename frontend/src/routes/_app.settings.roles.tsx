import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { RolePrivilegesTab } from "@/components/modules/roles/RolePrivilegesTab";

export const Route = createFileRoute("/_app/settings/roles")({
  head: () => ({ meta: [{ title: "Role & Permission Configuration — HMS" }] }),
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === "super_admin" || user?.backendRole === "Super Admin";
    if (!isSuperAdmin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SettingsRolesPage,
});

function SettingsRolesPage() {
  return (
    <div className="space-y-4 p-6">
      <RolePrivilegesTab />
    </div>
  );
}
