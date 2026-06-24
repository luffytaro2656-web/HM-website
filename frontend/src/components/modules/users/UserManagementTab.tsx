import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserList, type UserAccount } from "@/components/modules/users/UserList";
import { CreateUserForm, type CreateUserFormValues } from "@/components/modules/users/CreateUserForm";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { UserPlus, X, RefreshCw } from "lucide-react";
import {
  getUsersRequest,
  createUserRequest,
  approveUserRequest,
  rejectUserRequest,
  updateUserStatusRequest,
  deleteUserRequest,
} from "@/lib/api/auth";

const INITIAL_MOCK_USERS: UserAccount[] = [
  {
    id: 1,
    name: "Dr. Arjun Iyer",
    email: "arjun@hms.com",
    role: "Super Admin",
    hospital_id: null,
    status: "Active",
  },
  {
    id: 2,
    name: "Dr. Shalini Mukerjee",
    email: "shalini@hms.com",
    role: "Doctor",
    hospital_id: "H001",
    status: "Active",
  },
  {
    id: 3,
    name: "Nurse Maria Rose",
    email: "maria.rose@hms.com",
    role: "Nurse",
    hospital_id: "H001",
    status: "Pending Approval",
  },
];

export function UserManagementTab() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_MOCK_USERS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUsers = async (silent = false) => {
    if (!silent) setIsFetching(true);
    try {
      const data = await getUsersRequest();
      setUsers(data);
    } catch (err: any) {
      console.warn("Could not fetch real database users. Displaying client-side roster:", err.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, []);

  const handleCreateUser = async (values: CreateUserFormValues) => {
    setIsLoading(true);
    try {
      await createUserRequest({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        hospitalId: values.hospitalId || null,
      });

      toast.success("User account registered successfully!");
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user account.");
      
      // Fallback local modification for testing
      const newMockUser: UserAccount = {
        id: Date.now(),
        name: values.name,
        email: values.email,
        role: values.role,
        hospital_id: values.hospitalId || null,
        status: currentUser?.role === "super_admin" ? "Active" : "Pending Approval",
      };
      setUsers((prev) => [...prev, newMockUser]);
      setIsCreateOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveUserRequest(id);
      toast.success("User registration approved!");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve user.");
      
      // Fallback local update
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "Active" } : u))
      );
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectUserRequest(id);
      toast.success("User registration rejected.");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject user.");
      
      // Fallback local update
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: "Active" | "Inactive") => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await updateUserStatusRequest(id, nextStatus);
      toast.success(`User account is now ${nextStatus}.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status.");
      
      // Fallback local update
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user account?")) return;
    try {
      await deleteUserRequest(id);
      toast.success("User account deleted.");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user account.");
      
      // Fallback local update
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">User Provisioning & Roster</h3>
          <p className="text-xs text-muted-foreground">Manage roles, branch visibility scopes, and credentials requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={isFetching}
            className="h-8 px-2"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1 text-xs"
          >
            <UserPlus className="size-3.5" />
            Provision Account
          </Button>
        </div>
      </div>

      {isCreateOpen && (
        <div className="relative rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h4 className="text-xs font-bold flex items-center gap-1.5 text-primary">
              <UserPlus className="size-3.5" />
              Register New System login Account
            </h4>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <CreateUserForm
            onSubmit={handleCreateUser}
            isLoading={isLoading}
            onCancel={() => setIsCreateOpen(false)}
          />
        </div>
      )}

      <UserList
        users={users}
        currentUserRole={currentUser?.role || "staff"}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
    </div>
  );
}
