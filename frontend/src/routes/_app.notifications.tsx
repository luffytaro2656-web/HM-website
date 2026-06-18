import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notification Hub — HMS" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">Notification Hub</h1>
      <p className="mt-1 text-sm text-muted-foreground">This is a placeholder page for the Notification Hub module.</p>
    </div>
  );
}
