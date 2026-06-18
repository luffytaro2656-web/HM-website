import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    // Client-side redirect after hydration; avoid throwing during SSR for persisted store
    if (typeof window !== "undefined") {
      return <Navigate to="/login" />;
    }
    return null;
  }
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
