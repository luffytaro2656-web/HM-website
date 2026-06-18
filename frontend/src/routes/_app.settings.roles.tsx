import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/roles")({
  head: () => ({ meta: [{ title: "Role & Permission Configuration — HMS" }] }),
  component: SettingsRolesPage,
});

function SettingsRolesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">Role & Permission Configuration</h1>
      <p className="mt-1 text-sm text-muted-foreground">This is a placeholder page for the Role & Permission Configuration module.</p>
    </div>
  );
}
