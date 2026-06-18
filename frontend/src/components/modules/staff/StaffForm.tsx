import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HOSPITALS } from "@/mocks/hospitals";
import { addStaffMember, updateStaffMember } from "@/mocks/staff";
import { toast } from "sonner";
import type { StaffMember, StaffRole, Shift } from "@/types/staff";
import { UserCheck, ShieldCheck, Mail, Phone, GraduationCap, Calendar, Landmark } from "lucide-react";

interface StaffFormProps {
  initialData?: StaffMember; // If editing
  onSuccess?: () => void;
}

const ROLES: StaffRole[] = ["Nurse", "Lab Tech", "Admin", "Support", "Pharmacist"];
const SHIFTS: Shift[] = ["Morning", "Evening", "Night"];
const DEPTS = ["Emergency", "ICU", "OPD", "Pharmacy", "Laboratory", "Reception", "Surgery", "Pediatrics"];

export function StaffForm({ initialData, onSuccess }: StaffFormProps) {
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [role, setRole] = useState<StaffRole>(initialData?.role || "Nurse");
  const [hospitalId, setHospitalId] = useState(initialData?.hospitalId || HOSPITALS[0].id);
  const [department, setDepartment] = useState(initialData?.department || DEPTS[0]);
  const [shift, setShift] = useState<Shift>(initialData?.shift || "Morning");
  const [salary, setSalary] = useState<number>(initialData?.salary || 25000);
  const [contact, setContact] = useState(initialData?.contact || "");
  const [qualifications, setQualifications] = useState(initialData?.qualifications || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [employmentDate, setEmploymentDate] = useState(
    initialData?.employmentDate || new Date().toISOString().slice(0, 10)
  );

  // Login credentials states
  const [hasLogin, setHasLogin] = useState(initialData?.hasLogin || false);
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !contact || !email) {
      toast.error("Please fill in all mandatory fields (Name, Contact, Email)");
      return;
    }

    const payload = {
      name,
      role,
      hospitalId,
      department,
      shift,
      salary,
      contact,
      status: (initialData?.status || "Active") as "Active" | "Inactive",
      qualifications,
      employmentDate,
      email,
      hasLogin,
      username: hasLogin ? username || name.toLowerCase().replace(" ", ".") : undefined,
    };

    if (isEdit && initialData) {
      const updated = updateStaffMember(initialData.id, payload);
      if (updated) {
        toast.success("Profile Updated!", {
          description: `Successfully saved changes for ${name}.`,
        });
        if (onSuccess) onSuccess();
      }
    } else {
      const added = addStaffMember(payload);
      if (added) {
        toast.success("Staff Member Enrolled!", {
          description: `Assigned ID ${added.id} for ${name}.`,
        });
        // Reset if not editing
        setName("");
        setContact("");
        setQualifications("");
        setEmail("");
        setSalary(25000);
        setHasLogin(false);
        setUsername("");
        setPassword("");
        if (onSuccess) onSuccess();
      }
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <UserCheck className="size-5 text-primary" />
          {isEdit ? "Update Personnel Profile" : "Enlist Hospital Personnel"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isEdit
            ? "Modify employment status, salary grades, or login credentials."
            : "Enroll non-doctor staff, nurses, technicians, receptionists, or administrative assistants."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                placeholder="e.g. Ramesh Kumar"
                className="text-xs h-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Primary Role</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shift Schedule</Label>
                <Select value={shift} onValueChange={(v: any) => setShift(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hospital Branch</Label>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {HOSPITALS.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department Assignment</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Landmark className="size-3 text-muted-foreground" />
                Monthly Base Salary (₹)
              </Label>
              <Input
                type="number"
                className="text-xs h-9"
                value={salary}
                onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Contact and Qualifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Phone className="size-3 text-muted-foreground" />
                  Contact Helpline
                </Label>
                <Input
                  placeholder="+91 9988776655"
                  className="text-xs h-9"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Mail className="size-3 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="ramesh.k@hms-care.in"
                  className="text-xs h-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <GraduationCap className="size-3 text-muted-foreground" />
                  Qualifications
                </Label>
                <Input
                  placeholder="e.g. B.Sc Nursing, DMLT"
                  className="text-xs h-9"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  Employment Start Date
                </Label>
                <Input
                  type="date"
                  className="text-xs h-9"
                  value={employmentDate}
                  onChange={(e) => setEmploymentDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* System Account Settings */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="enableLogin"
                checked={hasLogin}
                onChange={(e) => setHasLogin(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="enableLogin" className="text-xs font-bold flex items-center gap-1 cursor-pointer">
                <ShieldCheck className="size-3.5 text-primary" />
                Enable System Account Login Access
              </Label>
            </div>

            {hasLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 animate-fadeIn">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Staff Login Username</Label>
                  <Input
                    placeholder="e.g. ramesh.kumar"
                    className="text-xs h-9 bg-background"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Used by the employee to access their roles desk portal.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Temporary Credentials Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="text-xs h-9 bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Requires forced reset on first portal entry.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" className="text-xs h-9">
              {isEdit ? "Save Profile Changes" : "Enroll Personnel Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
