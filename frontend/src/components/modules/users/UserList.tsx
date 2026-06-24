import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOSPITALS } from "@/mocks/hospitals";
import { Check, X, ShieldAlert, CheckCircle, Ban, Trash2 } from "lucide-react";

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: string;
  hospital_id: string | null;
  status: "Active" | "Inactive" | "Pending Approval";
  created_at?: string;
}

interface UserListProps {
  users: UserAccount[];
  currentUserRole: string;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onToggleStatus?: (id: number, currentStatus: "Active" | "Inactive") => void;
  onDelete?: (id: number) => void;
}

export function UserList({
  users,
  currentUserRole,
  onApprove,
  onReject,
  onToggleStatus,
  onDelete,
}: UserListProps) {
  const isSuperAdmin = currentUserRole === "super_admin";

  const getHospitalName = (id: string | null) => {
    if (!id) return "All Branches (Global)";
    const h = HOSPITALS.find((hosp) => hosp.id === id);
    return h ? `${h.name} (${h.city})` : id;
  };

  const getStatusBadge = (status: UserAccount["status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 text-xs py-0.5">Active</Badge>;
      case "Inactive":
        return <Badge className="bg-danger/10 text-danger hover:bg-danger/10 text-xs py-0.5">Inactive</Badge>;
      case "Pending Approval":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 text-xs py-0.5">Pending Approval</Badge>;
      default:
        return null;
    }
  };

  const pendingUsers = users.filter((u) => u.status === "Pending Approval");
  const approvedUsers = users.filter((u) => u.status !== "Pending Approval");

  return (
    <div className="space-y-6">
      {/* Pending Approvals Section - Only for Super Admin */}
      {isSuperAdmin && pendingUsers.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
            <ShieldAlert className="size-4" />
            <span>Registration Requests Pending Approval ({pendingUsers.length})</span>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="p-3 border-b">Full Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Role</th>
                  <th className="p-3 border-b">Hospital Branch</th>
                  <th className="p-3 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-medium text-foreground">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-md bg-primary-light px-2 py-0.5 font-medium text-primary text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{getHospitalName(u.hospital_id)}</td>
                    <td className="p-3 text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-emerald-500 hover:bg-emerald-500/10"
                        title="Approve Request"
                        onClick={() => onApprove?.(u.id)}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-danger hover:bg-danger/10"
                        title="Reject / Delete Request"
                        onClick={() => onReject?.(u.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Users Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Registered User Accounts</h3>
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="p-3 border-b">Full Name</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Role</th>
                <th className="p-3 border-b">Hospital Branch</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {approvedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No active user accounts found.
                  </td>
                </tr>
              ) : (
                approvedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-medium text-foreground">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-md bg-primary-light px-2 py-0.5 font-medium text-primary text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{getHospitalName(u.hospital_id)}</td>
                    <td className="p-3">{getStatusBadge(u.status)}</td>
                    <td className="p-3 text-right space-x-1">
                      {onToggleStatus && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`size-7 ${
                            u.status === "Active"
                              ? "text-amber-500 hover:bg-amber-500/10"
                              : "text-emerald-500 hover:bg-emerald-500/10"
                          }`}
                          title={u.status === "Active" ? "Deactivate User" : "Activate User"}
                          onClick={() => onToggleStatus(u.id, u.status as "Active" | "Inactive")}
                        >
                          {u.status === "Active" ? <Ban className="size-3.5" /> : <CheckCircle className="size-3.5" />}
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-danger hover:bg-danger/10"
                          title="Delete Account"
                          onClick={() => onDelete(u.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
