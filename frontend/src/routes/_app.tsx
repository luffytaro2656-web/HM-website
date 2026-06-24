import { useEffect } from "react";
import { createFileRoute, Outlet, Navigate, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { getPermissionsRequest } from "@/lib/api/permissions";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    setMobileSidebar(false);
  }, [pathname, setMobileSidebar]);

  useEffect(() => {
    if (user && accessToken) {
      getPermissionsRequest()
        .then((perms) => {
          setPermissions(perms);
        })
        .catch((err) => {
          console.error("Failed to sync permissions with backend:", err);
        });
    }
  }, [user, accessToken, setPermissions]);

  if (!user) {
    // Client-side redirect after hydration; avoid throwing during SSR for persisted store
    if (typeof window !== "undefined") {
      return <Navigate to="/login" />;
    }
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
          mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileSidebar(false)}
      />

      {/* Mobile Sidebar Overlay Drawer Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-300 ease-in-out md:hidden shadow-xl",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar forceExpanded />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
