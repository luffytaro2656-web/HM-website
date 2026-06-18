import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HOSPITALS, HOSPITAL_BEDS, addHospitalBed, updateHospitalBedStatus } from "@/mocks/hospitals";
import { toast } from "sonner";
import { BedDouble, PlusCircle, CheckCircle2, AlertTriangle, Hammer, Search, ShieldCheck } from "lucide-react";

interface BedStatusGridProps {
  hospitalId?: string; // Optional: filters to a single hospital
}

export function BedStatusGrid({ hospitalId }: BedStatusGridProps) {
  // If hospitalId is not passed, let user select one (Super Admin mode)
  const [selectedHospId, setSelectedHospId] = useState(hospitalId || HOSPITALS[0].id);
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Bed states
  const [showAddBed, setShowAddBed] = useState(false);
  const [newWardName, setNewWardName] = useState("General Ward A");
  const [newCategory, setNewCategory] = useState<"General" | "ICU" | "Private">("General");
  const [newStatus, setNewStatus] = useState<"Available" | "Occupied" | "Maintenance">("Available");
  const [newNotes, setNewNotes] = useState("");

  // Edit Bed status states
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"Available" | "Occupied" | "Maintenance">("Available");
  const [editNotes, setEditNotes] = useState("");

  const activeHospId = hospitalId || selectedHospId;

  // Filter beds
  const hospitalBeds = HOSPITAL_BEDS.filter((bed) => {
    if (bed.hospitalId !== activeHospId) return false;
    if (wardFilter !== "all" && bed.wardName !== wardFilter) return false;
    if (statusFilter !== "all" && bed.status !== statusFilter) return false;
    return true;
  });

  // Unique wards list for filtering
  const uniqueWards = Array.from(
    new Set(HOSPITAL_BEDS.filter((b) => b.hospitalId === activeHospId).map((b) => b.wardName))
  );

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardName) {
      toast.error("Please enter a ward name");
      return;
    }

    const bed = addHospitalBed(activeHospId, newWardName, newCategory, newStatus, newNotes);
    if (bed) {
      toast.success("Bed Registered!", {
        description: `Successfully added bed ${bed.id} to ${newWardName}.`,
      });
      setShowAddBed(false);
      setNewNotes("");
    }
  };

  const handleUpdateBedStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) return;

    const bed = updateHospitalBedStatus(activeHospId, selectedBedId, editStatus, editNotes);
    if (bed) {
      toast.success("Bed Status Updated!", {
        description: `Bed ${selectedBedId} marked as ${editStatus}.`,
      });
      setSelectedBedId(null);
    }
  };

  const startEditBed = (bed: typeof HOSPITAL_BEDS[0]) => {
    setSelectedBedId(bed.id);
    setEditStatus(bed.status);
    setEditNotes(bed.notes || "");
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
                    {HOSPITALS.map((h) => (
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
              Install a new physical bed unit into a selected ward category.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAddBedSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Ward Name</Label>
                  <Select value={newWardName} onValueChange={setNewWardName}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Ward A">General Ward A</SelectItem>
                      <SelectItem value="ICU Wing">ICU Wing</SelectItem>
                      <SelectItem value="Private Suite B">Private Suite B</SelectItem>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 animate-fadeIn">
        {hospitalBeds.length > 0 ? (
          hospitalBeds.map((bed) => {
            let colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
            let Icon = CheckCircle2;
            if (bed.status === "Occupied") {
              colorClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25";
              Icon = BedDouble;
            } else if (bed.status === "Maintenance") {
              colorClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
              Icon = Hammer;
            }

            return (
              <button
                key={bed.id}
                onClick={() => startEditBed(bed)}
                className={`border rounded-xl p-3.5 flex flex-col items-center text-center justify-between transition-all hover:scale-[1.03] ${colorClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-transparent bg-background/50">
                    {bed.category}
                  </Badge>
                  <Icon className="size-3.5" />
                </div>
                <div className="my-2.5">
                  <span className="font-mono font-bold text-sm block">{bed.id}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase">{bed.status}</span>
                </div>
                <div className="text-[9px] text-muted-foreground truncate w-full">
                  {bed.wardName}
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full border border-dashed border-border p-12 text-center text-muted-foreground text-xs italic">
            No physical beds matched the search criteria.
          </div>
        )}
      </div>

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
                  <Label className="text-xs font-semibold">Maintenance or Medical Notes</Label>
                  <Input
                    className="text-xs h-8"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedBedId(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
