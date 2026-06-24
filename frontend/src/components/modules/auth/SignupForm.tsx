import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOSPITALS } from "@/mocks/hospitals";
import { ROLE_LABELS, type Role } from "@/types/common";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["super_admin", "hospital_admin", "doctor", "nurse", "staff", "patient"]),
    hospitalId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role !== "super_admin" && !data.hospitalId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select an assigned hospital branch",
      path: ["hospitalId"],
    }
  );

export type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (values: SignupFormValues) => void;
  isLoading: boolean;
  onToggleForm: () => void;
}

export function SignupForm({ onSubmit, isLoading, onToggleForm }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "hospital_admin",
      hospitalId: HOSPITALS[0].id,
    },
  });

  const selectedRole = watch("role");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          placeholder="Dr. Arjun Iyer"
          {...register("name")}
          className="mt-1.5"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="signup-email">Email Address</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="arjun@hms.com"
          {...register("email")}
          className="mt-1.5"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className="mt-1.5"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="signup-role">Role Scope</Label>
        <select
          id="signup-role"
          {...register("role")}
          className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm"
        >
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-xs text-danger">{errors.role.message}</p>
        )}
      </div>

      {selectedRole !== "super_admin" && (
        <div>
          <Label htmlFor="signup-hospitalId">Assigned Hospital Branch</Label>
          <select
            id="signup-hospitalId"
            {...register("hospitalId")}
            className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">-- Select a Hospital --</option>
            {HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-danger">{errors.hospitalId.message}</p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Register Account"}
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onToggleForm}
          className="text-primary font-semibold hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
