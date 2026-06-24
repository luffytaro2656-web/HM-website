import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOSPITALS } from "@/mocks/hospitals";
import { useAuthStore } from "@/store/authStore";

const ALL_ROLES = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Hospital Admin", label: "Hospital Admin" },
  { value: "Hospital Manager", label: "Hospital Manager" },
  { value: "Doctor", label: "Doctor" },
  { value: "Nurse", label: "Nurse" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Billing Executive", label: "Billing Executive" },
  { value: "Pharmacy Staff", label: "Pharmacy Staff" },
  { value: "Lab Technician", label: "Lab Technician" },
  { value: "Patient", label: "Patient" },
] as const;

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Please select a role"),
  hospitalId: z.string().optional(),
}).refine(
  (data) => {
    // If not a Super Admin, hospitalId is required
    if (data.role !== "Super Admin" && !data.hospitalId) {
      return false;
    }
    return true;
  },
  {
    message: "Please assign a hospital branch for this role",
    path: ["hospitalId"],
  }
);

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSubmit: (values: CreateUserFormValues) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function CreateUserForm({ onSubmit, isLoading, onCancel }: CreateUserFormProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "super_admin";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: isSuperAdmin ? "Hospital Admin" : "Doctor",
      hospitalId: isSuperAdmin ? undefined : currentUser?.hospitalId,
    },
  });

  const selectedRole = watch("role");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="create-user-name">Full Name</Label>
          <Input
            id="create-user-name"
            placeholder="e.g. Dr. Priya Sharma"
            {...register("name")}
            className="mt-1.5 h-9 text-xs"
          />
          {errors.name && (
            <p className="mt-1 text-[10px] text-danger">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="create-user-email">Email Address</Label>
          <Input
            id="create-user-email"
            type="email"
            placeholder="priya@hms.com"
            {...register("email")}
            className="mt-1.5 h-9 text-xs"
          />
          {errors.email && (
            <p className="mt-1 text-[10px] text-danger">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="create-user-password">Login Password</Label>
          <Input
            id="create-user-password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="mt-1.5 h-9 text-xs"
          />
          {errors.password && (
            <p className="mt-1 text-[10px] text-danger">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="create-user-role">System Role Scope</Label>
          <select
            id="create-user-role"
            {...register("role")}
            className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-xs"
          >
            {ALL_ROLES.filter((r) => {
              // Hospital admins can only create non-admin hospital roles
              if (!isSuperAdmin) {
                return r.value !== "Super Admin" && r.value !== "Hospital Admin";
              }
              return true;
            }).map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-[10px] text-danger">{errors.role.message}</p>
          )}
        </div>
      </div>

      {isSuperAdmin && selectedRole !== "Super Admin" && (
        <div>
          <Label htmlFor="create-user-hospitalId">Assigned Hospital Branch</Label>
          <select
            id="create-user-hospitalId"
            {...register("hospitalId")}
            className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-xs"
          >
            <option value="">-- Select Hospital --</option>
            {HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
          {errors.hospitalId && (
            <p className="mt-1 text-[10px] text-danger">{errors.hospitalId.message}</p>
          )}
        </div>
      )}

      {!isSuperAdmin && (
        <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground">
          <strong>Branch Scope Locked:</strong> Accounts created by Hospital Admins are auto-bound to your active branch.
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Creating User..." : "Provision User Account"}
        </Button>
      </div>
    </form>
  );
}
