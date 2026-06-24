import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { registerHospitalSchema, RegisterHospitalFormValues } from "@/types/hospital";

const RECOMMENDED_FACILITIES = [
  "OPD Desk",
  "ICU Ward",
  "Diagnostic Laboratory",
  "24/7 Emergency Care",
  "Ambulance fleet",
  "Pharmacy",
  "Blood Bank",
  "Radiology/Imaging",
];

const RECOMMENDED_DEPARTMENTS = [
  "Outpatient (OPD)",
  "ICU Unit",
  "Surgical Department",
  "Pharmacy",
  "Laboratory Desk",
  "Emergency Services",
  "Pediatrics",
  "Cardiology",
  "Neurology",
];

interface RegisterHospitalFormProps {
  onSubmit: (values: RegisterHospitalFormValues) => void;
  onCancel: () => void;
}

export function RegisterHospitalForm({ onSubmit, onCancel }: RegisterHospitalFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterHospitalFormValues>({
    resolver: zodResolver(registerHospitalSchema),
    defaultValues: {
      city: "Chennai",
      totalBeds: 150,
      operatingHours: "24/7 Fully Operational",
      status: "Active",
      facilities: ["OPD Desk", "24/7 Emergency Care"],
      departments: ["Outpatient (OPD)", "Emergency Services"],
    },
  });

  const selectedFacilities = watch("facilities") || [];
  const selectedDepartments = watch("departments") || [];

  // Custom Input States
  const [customFacility, setCustomFacility] = useState("");
  const [customFacilitiesList, setCustomFacilitiesList] = useState<string[]>([]);
  const [customDepartment, setCustomDepartment] = useState("");
  const [customDepartmentsList, setCustomDepartmentsList] = useState<string[]>([]);

  const handleAddCustomFacility = (e: React.MouseEvent) => {
    e.preventDefault();
    const value = customFacility.trim();
    if (value) {
      if (!customFacilitiesList.includes(value) && !RECOMMENDED_FACILITIES.includes(value)) {
        setCustomFacilitiesList((prev) => [...prev, value]);
      }
      if (!selectedFacilities.includes(value)) {
        setValue("facilities", [...selectedFacilities, value], { shouldValidate: true });
      }
      setCustomFacility("");
    }
  };

  const handleAddCustomDepartment = (e: React.MouseEvent) => {
    e.preventDefault();
    const value = customDepartment.trim();
    if (value) {
      if (!customDepartmentsList.includes(value) && !RECOMMENDED_DEPARTMENTS.includes(value)) {
        setCustomDepartmentsList((prev) => [...prev, value]);
      }
      if (!selectedDepartments.includes(value)) {
        setValue("departments", [...selectedDepartments, value], { shouldValidate: true });
      }
      setCustomDepartment("");
    }
  };

  const toggleFacility = (facility: string) => {
    if (selectedFacilities.includes(facility)) {
      setValue(
        "facilities",
        selectedFacilities.filter((f) => f !== facility),
        { shouldValidate: true }
      );
    } else {
      setValue("facilities", [...selectedFacilities, facility], { shouldValidate: true });
    }
  };

  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      setValue(
        "departments",
        selectedDepartments.filter((d) => d !== dept),
        { shouldValidate: true }
      );
    } else {
      setValue("departments", [...selectedDepartments, dept], { shouldValidate: true });
    }
  };

  return (
    <Card className="max-w-2xl w-full bg-card border border-border overflow-hidden max-h-[85vh] flex flex-col">
      <CardHeader className="p-5 border-b border-border shrink-0 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">Register Hospital Branch</CardTitle>
          <CardDescription className="text-xs">Add location, operations, and facilities details.</CardDescription>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
        <CardContent className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* General Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hospital Name</Label>
              <Input
                placeholder="e.g. Kauvery Specialized Hospital"
                className="text-xs h-9"
                {...register("name")}
              />
              {errors.name && <p className="text-[10px] text-danger">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">City Location</Label>
              <Select defaultValue="Chennai" onValueChange={(val) => setValue("city", val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                  <SelectItem value="Madurai">Madurai</SelectItem>
                  <SelectItem value="Salem">Salem</SelectItem>
                  <SelectItem value="Trichy">Trichy</SelectItem>
                  <SelectItem value="Vellore">Vellore</SelectItem>
                  <SelectItem value="Tirunelveli">Tirunelveli</SelectItem>
                  <SelectItem value="Erode">Erode</SelectItem>
                </SelectContent>
              </Select>
              {errors.city && <p className="text-[10px] text-danger">{errors.city.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Beds Capacity</Label>
              <Input
                type="number"
                className="text-xs h-9"
                {...register("totalBeds")}
              />
              {errors.totalBeds && <p className="text-[10px] text-danger">{errors.totalBeds.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Helpline Contact</Label>
              <Input
                placeholder="e.g. +91 9876543210"
                className="text-xs h-9"
                {...register("contact")}
              />
              {errors.contact && <p className="text-[10px] text-danger">{errors.contact.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Operating Hours</Label>
              <Input
                placeholder="e.g. 24/7 Fully Operational"
                className="text-xs h-9"
                {...register("operatingHours")}
              />
              {errors.operatingHours && <p className="text-[10px] text-danger">{errors.operatingHours.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Operational Status</Label>
              <Select defaultValue="Active" onValueChange={(val: any) => setValue("status", val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-[10px] text-danger">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Detailed Street Address</Label>
            <Input
              placeholder="e.g. 12, Kauvery Main Rd, Alwarpet"
              className="text-xs h-9"
              {...register("address")}
            />
            {errors.address && <p className="text-[10px] text-danger">{errors.address.message}</p>}
          </div>

          <hr className="border-border" />

          {/* Recommended Facilities Checkboxes */}
          <div className="space-y-2.5">
            <div>
              <Label className="text-xs font-semibold">Facilities list</Label>
              <p className="text-[10px] text-muted-foreground">Select facilities offered at this branch.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-accent/10 p-3 rounded-lg border border-border/50">
              {[...RECOMMENDED_FACILITIES, ...customFacilitiesList].map((facility) => {
                const isChecked = selectedFacilities.includes(facility);
                return (
                  <div key={facility} className="flex items-center gap-2">
                    <Checkbox
                      id={`facility-${facility}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleFacility(facility)}
                    />
                    <label
                      htmlFor={`facility-${facility}`}
                      className="text-xs font-medium text-foreground cursor-pointer select-none leading-none"
                    >
                      {facility}
                    </label>
                  </div>
                );
              })}
            </div>
            {errors.facilities && <p className="text-[10px] text-danger">{errors.facilities.message}</p>}

            {/* Add Custom Facility */}
            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Add custom facility manually..."
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                className="text-xs h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFacility(e as any);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomFacility}
                className="h-8 text-xs gap-1"
              >
                <Plus className="size-3" /> Add
              </Button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Recommended Departments Checkboxes */}
          <div className="space-y-2.5">
            <div>
              <Label className="text-xs font-semibold">Active Departments</Label>
              <p className="text-[10px] text-muted-foreground">Select departments to seed inside the branch registry.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-accent/10 p-3 rounded-lg border border-border/50">
              {[...RECOMMENDED_DEPARTMENTS, ...customDepartmentsList].map((dept) => {
                const isChecked = selectedDepartments.includes(dept);
                return (
                  <div key={dept} className="flex items-center gap-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleDepartment(dept)}
                    />
                    <label
                      htmlFor={`dept-${dept}`}
                      className="text-xs font-medium text-foreground cursor-pointer select-none leading-none"
                    >
                      {dept}
                    </label>
                  </div>
                );
              })}
            </div>
            {errors.departments && <p className="text-[10px] text-danger">{errors.departments.message}</p>}

            {/* Add Custom Department */}
            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Add custom department manually..."
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                className="text-xs h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomDepartment(e as any);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomDepartment}
                className="h-8 text-xs gap-1"
              >
                <Plus className="size-3" /> Add
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border bg-accent/5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onCancel}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" className="h-8 text-xs gap-1.5">
            <Check className="size-3.5" /> Register Branch
          </Button>
        </div>
      </form>
    </Card>
  );
}
