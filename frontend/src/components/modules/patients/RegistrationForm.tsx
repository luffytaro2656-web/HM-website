import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HOSPITALS } from "@/mocks/hospitals";
import { DOCTORS } from "@/mocks/doctors";
import { PATIENTS } from "@/mocks/patients";
import { UhidBadge } from "./UhidBadge";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { BloodGroup, Gender } from "@/types/common";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0, "Age must be a positive number").max(120, "Age cannot exceed 120"),
  gender: z.enum(["Male", "Female", "Other"] as const),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number (e.g., +919876543210)"),
  email: z.string().email("Please enter a valid email address"),
  hospitalId: z.string().min(1, "Please select a hospital"),
  doctorId: z.string().min(1, "Please select an admitting/consulting doctor"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const [registeredPatient, setRegisteredPatient] = useState<typeof PATIENTS[0] | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      gender: "Male",
      bloodGroup: "O+",
      hospitalId: HOSPITALS[0]?.id ?? "",
      doctorId: DOCTORS[0]?.id ?? "",
    },
  });

  const selectedHospitalId = watch("hospitalId");

  const onSubmit = async (data: RegistrationFormValues) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const id = `P${String(PATIENTS.length + 1).padStart(5, "0")}`;
    const uhid = `UHID-2024-${String(PATIENTS.length + 1).padStart(5, "0")}`;
    
    const newPatient = {
      id,
      uhid,
      name: data.name,
      age: data.age,
      gender: data.gender as Gender,
      bloodGroup: data.bloodGroup as BloodGroup,
      phone: data.phone,
      email: data.email,
      hospitalId: data.hospitalId,
      doctorId: data.doctorId,
      status: "Outpatient" as const,
      lastVisit: new Date().toISOString(),
    };

    // Add to the front of our global mocks
    PATIENTS.unshift(newPatient);
    setRegisteredPatient(newPatient);
    toast.success("Patient registered successfully!");
  };

  if (registeredPatient) {
    return (
      <Card className="mx-auto max-w-xl border-success/30 bg-success/5 shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle className="size-6" />
          </div>
          <CardTitle className="mt-4 text-xl font-bold text-success-foreground">Registration Successful</CardTitle>
          <CardDescription>The unique hospital identification has been generated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-background p-5 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <UhidBadge uhid={registeredPatient.uhid} className="text-sm py-1.5 px-4" />
              <h3 className="mt-2 text-lg font-bold">{registeredPatient.name}</h3>
              <p className="text-xs text-muted-foreground">
                {registeredPatient.age}y / {registeredPatient.gender} · Blood Group: {registeredPatient.bloodGroup}
              </p>
            </div>
            <hr className="my-4 border-dashed" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-semibold">{registeredPatient.phone}</p>
                <p className="text-muted-foreground">{registeredPatient.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Doctor</p>
                <p className="font-semibold">
                  {DOCTORS.find((d) => d.id === registeredPatient.doctorId)?.name ?? "Unknown"}
                </p>
                <p className="text-muted-foreground">
                  {HOSPITALS.find((h) => h.id === registeredPatient.hospitalId)?.name ?? "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setRegisteredPatient(null); reset(); }}>
            Register Another
          </Button>
          <Link to="/patients/$id" params={{ id: registeredPatient.id }}>
            <Button>View Profile</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl shadow-sm border-sidebar-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold">New Patient Intake Form</CardTitle>
        <CardDescription>Enter patient demographics and assign initial hospital routing details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age">Age (Years)</Label>
              <Input id="age" type="number" placeholder="45" {...register("age")} />
              {errors.age && <p className="text-xs text-danger">{errors.age.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue="Male" onValueChange={(v) => setValue("gender", v as any)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-danger">{errors.gender.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select defaultValue="O+" onValueChange={(v) => setValue("bloodGroup", v as any)}>
                <SelectTrigger id="bloodGroup">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
              {errors.bloodGroup && <p className="text-xs text-danger">{errors.bloodGroup.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+919876543210" {...register("phone")} />
              {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
          </div>

          <hr className="border-sidebar-border" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hospitalId">Hospital Branch</Label>
              <Select
                defaultValue={HOSPITALS[0]?.id}
                onValueChange={(v) => {
                  setValue("hospitalId", v);
                  // Update doctor list to match hospital if necessary, or let selection handle it
                }}
              >
                <SelectTrigger id="hospitalId">
                  <SelectValue placeholder="Select Hospital" />
                </SelectTrigger>
                <SelectContent>
                  {HOSPITALS.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hospitalId && <p className="text-xs text-danger">{errors.hospitalId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doctorId">Admitting Doctor</Label>
              <Select defaultValue={DOCTORS[0]?.id} onValueChange={(v) => setValue("doctorId", v)}>
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {DOCTORS.filter((d) => !selectedHospitalId || d.hospitalId === selectedHospitalId).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialization})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-xs text-danger">{errors.doctorId.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-sidebar-border px-6 py-4 bg-muted/20">
          <Link to="/patients">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" /> Registering...
              </>
            ) : (
              "Generate UHID & Register"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
