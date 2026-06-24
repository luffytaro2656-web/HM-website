import React from "react";
import { usePermission } from "@/hooks/usePermission";
import type { AppModule, PermissionAction } from "@/config/roleConfig";

interface GuardProps {
  module: AppModule;
  action?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Guard({ module, action, fallback = null, children }: GuardProps) {
  const { canAccess } = usePermission();

  if (canAccess(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
