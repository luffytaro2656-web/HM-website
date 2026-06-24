import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BedDouble, PlusCircle, CheckCircle2, AlertTriangle, Hammer, Search, ShieldCheck } from "lucide-react";
import {
  getHospitalsData,
  getHospitalDepartments,
  getHospitalBeds,
  createHospitalBed,
  updateHospitalBed,
  deleteHospitalBed,
} from "@/lib/api/hospitals";

interface BedStatusGridProps {
  hospitalId?: string; // Optional: filters to a single hospital
}

export function BedStatusGrid({ hospitalId }: BedStatusGridProps) {
  const queryClient = useQueryClient();
  const [selectedHospId, setSelectedHospId] = useState(hospitalId || "");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Bed states
  const [showAddBed, setShowAddBed] = useState(false);
  const [newWardName, setNewWardName] = useState("General Ward A");
  const [newCategory, setNewCategory] = useState<"General" | "ICU" | "Private">("General");
  const [newStatus, setNewStatus] = useState<"Available" | "Occupied" | "Maintenance">("Available");
  const [newNotes, setNewNotes] = useState("");
  const [newDeptId, setNewDeptId] = useState("");

  // Edit Bed status states
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"Available" | "Occupied" | "Maintenance">("Available");
  const [editNotes, setEditNotes] = useState("");
  const [editDeptId, setEditDeptId] = useState("");

  const handleWardChange = (wardName: string) => {
    setNewWardName(wardName);
    if (wardName.includes("ICU")) {
      setNewCategory("ICU");
    } else if (wardName.includes("Private")) {
      setNewCategory("Private");
    } else {
      setNewCategory("General");
    }
  };

  // Query Hospitals list
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: getHospitalsData,
    enabled: !hospitalId,
  });

  // Automatically select first hospital when loaded
  useEffect(() => {
    if (!hospitalId && hospitals.length > 0 && !selectedHospId) {
      setSelectedHospId(hospitals[0].id);
    }
  }, [hospitals, hospitalId, selectedHospId]);

  const activeHospId = hospitalId || selectedHospId;

  // Query Departments of the active hospital
  const { data: departments = [] } = useQuery({
    queryKey: ["hospitals", activeHospId, "departments"],
    queryFn: () => getHospitalDepartments(activeHospId),
    enabled: !!activeHospId,
  });

  // Query Beds of the active hospital
  const { data: beds = [], isLoading: isLoadingBeds } = useQuery({
    queryKey: ["hospitals", activeHospId, "beds"],
    queryFn: () => getHospitalBeds(activeHospId),
    enabled: !!activeHospId,
  });

  // Set default department when departments load
  useEffect(() => {
    if (departments.length > 0) {
      setNewDeptId(departments[0].id);
    }
  }, [departments]);

  // Filter beds
  const hospitalBeds = beds.filter((bed) => {
    if (wardFilter !== "all" && bed.wardName !== wardFilter) return false;
    if (statusFilter !== "all" && bed.status !== statusFilter) return false;
    return true;
  });

  // Unique wards list for filtering
  const uniqueWards = Array.from(new Set(beds.map((b) => b.wardName)));

  const createBedMutation = useMutation({
    mutationFn: (data: {
      departmentId: string;
      wardName: string;
      category: "General" | "ICU" | "Private";
      status: "Available" | "Occupied" | "Maintenance";
      notes?: string;
    }) => createHospitalBed(activeHospId, data),
    onSuccess: (newBed) => {
      toast.success("Bed Registered!", {
        description: `Successfully added bed ${newBed.id} to ${newBed.wardName}.`,
      });
      setShowAddBed(false);
      setNewNotes("");
      queryClient.invalidateQueries({ queryKey: ["hospitals", activeHospId, "beds"] });
    },
    onError: (err: any) => {
      toast.error("Failed to register bed", { description: err.message });
    },
  });

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardName) {
      toast.error("Please enter a ward name");
      return;
    }
    if (!newDeptId) {
      toast.error("Please select a department");
      return;
    }
    createBedMutation.mutate({
      departmentId: newDeptId,
      wardName: newWardName,
      category: newCategory,
      status: newStatus,
      notes: newNotes,
    });
  };

  const updateBedMutation = useMutation({
    mutationFn: (data: {
      status: "Available" | "Occupied" | "Maintenance";
      notes?: string;
      departmentId?: string;
    }) => updateHospitalBed(activeHospId, selectedBedId!, data),
    onSuccess: () => {
      toast.success("Bed Status Updated!", {
        description: `Bed ${selectedBedId} marked as ${editStatus}.`,
      });
      setSelectedBedId(null);
      queryClient.invalidateQueries({ queryKey: ["hospitals", activeHospId, "beds"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update bed status", { description: err.message });
    },
  });

  const handleUpdateBedStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) return;
    updateBedMutation.mutate({
      status: editStatus,
      notes: editNotes,
      departmentId: editDeptId || undefined,
    });
  };

  const deleteBedMutation = useMutation({
    mutationFn: () => deleteHospitalBed(activeHospId, selectedBedId!),
    onSuccess: () => {
      toast.success("Bed Deleted!", {
        description: `Successfully deleted bed ${selectedBedId}.`,
      });
      setSelectedBedId(null);
      queryClient.invalidateQueries({ queryKey: ["hospitals", activeHospId, "beds"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete bed", { description: err.message });
    },
  });

  const startEditBed = (bed: any) => {
    setSelectedBedId(bed.id);
    setEditStatus(bed.status);
    setEditNotes(bed.notes || "");
    setEditDeptId(bed.departmentId || "");
  };

  return (
    <div className="space-y-6">
      {/* Filters and Selection */}
      <Card className="border border-border p-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-wrap gap-4 items-end">
            {!hospitalId && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Hospital Branch</Label>
                <Select value={selectedHospId} onValueChange={setSelectedHospId}>
                  <SelectTrigger className="h-9 w-[200px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {hospitals.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Ward Filter</Label>
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="h-9 w-[180px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {uniqueWards.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[150px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowAddBed(!showAddBed)} className="text-xs h-9 gap-1">
              <PlusCircle className="size-3.5" />
              Add Facility Bed
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Bed Panel */}
      {showAddBed && (
        <Card className="border border-border animate-fadeIn">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">Register Physical Bed</CardTitle>
            <CardDescription className="text-xs">
              Install a new physical bed unit into a selected ward category and clinical department.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAddBedSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Ward Name</Label>
                  <Select value={newWardName} onValueChange={handleWardChange}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Ward A">General Ward A (General Care)</SelectItem>
                      <SelectItem value="Pediatric Ward">Pediatric Ward (General Care)</SelectItem>
                      <SelectItem value="Maternity Ward">Maternity Ward (General Care)</SelectItem>
                      <SelectItem value="ICU Wing">ICU Wing (Critical Care)</SelectItem>
                      <SelectItem value="Private Suite B">Private Suite B (Premium Suite)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Clinical Department</Label>
                  <Select value={newDeptId} onValueChange={setNewDeptId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bed Category</Label>
                  <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General (Standard Care)</SelectItem>
                      <SelectItem value="ICU">ICU (Critical Monitoring)</SelectItem>
                      <SelectItem value="Private">Private (Premium suite)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Initial Status</Label>
                  <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available (Vacant)</SelectItem>
                      <SelectItem value="Occupied">Occupied (Clinically Inpatient)</SelectItem>
                      <SelectItem value="Maintenance">Maintenance (Housekeeping)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Facilities Notes</Label>
                <Input
                  placeholder="e.g. Equipped with pulse oximeter, IV stand standard configuration..."
                  className="text-xs h-9"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddBed(false)} className="text-xs h-8">
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="text-xs h-8">
                  Register Bed
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Beds Grid */}
      {isLoadingBeds ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="border border-border bg-card rounded-xl p-4 h-[110px] animate-pulse"></div>
          ))}
        </div>
      ) : hospitalBeds.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 animate-fadeIn">
          {hospitalBeds.map((bed) => {
            let colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
            let Icon = CheckCircle2;
            if (bed.status === "Occupied") {
              colorClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25";
              Icon = BedDouble;
            } else if (bed.status === "Maintenance") {
              colorClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
              Icon = Hammer;
            }

            const dept = departments.find((d) => d.id === bed.departmentId);
            const deptLabel = dept ? dept.name : "";

            return (
              <button
                key={bed.id}
                onClick={() => startEditBed(bed)}
                className={`border rounded-xl p-3 flex flex-col items-center text-center justify-between transition-all hover:scale-[1.03] ${colorClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-transparent bg-background/50">
                    {bed.category}
                  </Badge>
                  <Icon className="size-3.5" />
                </div>
                <div className="my-2">
                  <span className="font-mono font-bold text-sm block">{bed.id}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase">{bed.status}</span>
                </div>
                <div className="text-[8px] text-muted-foreground truncate w-full">
                  {bed.wardName} {deptLabel && `(${deptLabel})`}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground text-xs italic">
          No physical beds matched the search criteria.
        </div>
      )}

      {/* Edit Bed status Modal dialog */}
      {selectedBedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-sm w-full bg-card border border-border">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold">Update Facility Bed ({selectedBedId})</CardTitle>
              <CardDescription className="text-xs">
                Alter operational parameters or log deep sanitization status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form onSubmit={handleUpdateBedStatusSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Change Operational Status</Label>
                  <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available (Vacant & Sanitized)</SelectItem>
                      <SelectItem value="Occupied">Occupied (Patient Admitted)</SelectItem>
                      <SelectItem value="Maintenance">Maintenance (Housekeeping)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assign Clinical Department</Label>
                  <Select value={editDeptId} onValueChange={setEditDeptId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Maintenance or Medical Notes</Label>
                  <Input
                    className="text-xs h-8"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-between gap-2 pt-2 border-t border-border">
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this bed?")) {
                        deleteBedMutation.mutate();
                      }
                    }}
                    className="h-8 text-xs"
                  >
                    Delete Bed
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setSelectedBedId(null)} className="h-8 text-xs">
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" className="h-8 text-xs">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
