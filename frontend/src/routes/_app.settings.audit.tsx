import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/audit")({
  head: () => ({ meta: [{ title: "System Audit Logs — HMS" }] }),
  component: SettingsAuditPage,
});

function SettingsAuditPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
      <p className="mt-1 text-sm text-muted-foreground">This is a placeholder page for the System Audit Logs module.</p>
    </div>
  );
}
