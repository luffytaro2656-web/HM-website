import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HOSPITALS, DEPARTMENTS } from "@/mocks/hospitals";
import { toast } from "sonner";
import { Stethoscope, Users, PlusCircle, Search, Edit3, ShieldAlert, CheckCircle } from "lucide-react";
import {
  getHospitalsData,
  getHospitalDepartments,
  createDepartmentRequest,
  updateDepartmentRequest,
} from "@/lib/api/hospitals";

interface DepartmentListProps {
  hospitalId?: string; // Optional: if provided, filters to that hospital only
}

export function DepartmentList({ hospitalId }: DepartmentListProps) {
  // If hospitalId is not passed, let user select one (Super Admin mode)
  const [hospitals, setHospitals] = useState<any[]>(HOSPITALS);
  const [selectedHospId, setSelectedHospId] = useState(hospitalId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingDepts, setLoadingDepts] = useState(true);
  
  // Add state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newHead, setNewHead] = useState("");
  const [newStaffCount, setNewStaffCount] = useState<number>(12);
  const [newBedCount, setNewBedCount] = useState<number>(8);

  // Edit state
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHead, setEditHead] = useState("");
  const [editStaffCount, setEditStaffCount] = useState<number>(10);
  const [editBedCount, setEditBedCount] = useState<number>(10);
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");

  const activeHospId = hospitalId || selectedHospId;

  // Fetch hospitals on mount
  useEffect(() => {
    getHospitalsData()
      .then((data) => {
        if (data && data.length > 0) {
          setHospitals(data);
          if (!hospitalId) {
            setSelectedHospId(data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load hospitals for department list:", err);
      });
  }, []);

  // Fetch departments for the active hospital
  useEffect(() => {
    if (!activeHospId) return;
    setLoadingDepts(true);
    getHospitalDepartments(activeHospId)
      .then((data) => {
        setDepartmentsList(data);
      })
      .catch((err) => {
        console.error("Failed to load departments from backend, falling back to mock:", err);
        const mocks = DEPARTMENTS.filter((d) => d.hospitalId === activeHospId);
        setDepartmentsList(mocks);
      })
      .finally(() => setLoadingDepts(false));
  }, [activeHospId, refreshKey]);

  // Filter departments
  const hospitalDepts = departmentsList.filter(
    (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newHead) {
      toast.error("Please fill in the department name and head of department");
      return;
    }

    try {
      await createDepartmentRequest(activeHospId, {
        name: newDeptName,
        headOfDepartment: newHead,
        staffCount: newStaffCount,
        bedCount: 0,
      });

      toast.success("Department Created!", {
        description: `Successfully added ${newDeptName} to the department registry.`,
      });

      setNewDeptName("");
      setNewHead("");
      setNewStaffCount(12);
      setShowAddForm(false);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      console.error("Failed to create department:", error);
      toast.error("Failed to create department", {
        description: error.message || "Something went wrong.",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeptId) return;

    try {
      await updateDepartmentRequest(activeHospId, editDeptId, {
        name: editName,
        headOfDepartment: editHead,
        staffCount: editStaffCount,
        bedCount: 0,
        status: editStatus,
      });

      toast.success("Department Updated!", {
        description: `Changes for ${editName} saved successfully.`,
      });

      setEditDeptId(null);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      console.error("Failed to update department:", error);
      toast.error("Failed to update department", {
        description: error.message || "Something went wrong.",
      });
    }
  };

  const startEdit = (dept: any) => {
    setEditDeptId(dept.id);
    setEditName(dept.name);
    setEditHead(dept.headOfDepartment);
    setEditStaffCount(dept.staffCount);
    setEditBedCount(dept.bedCount);
    setEditStatus(dept.status);
  };

  return (
    <div className="space-y-6">
      {/* Top selection bar for Super Admin */}
      {!hospitalId && (
        <Card className="border border-border p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Branch Hospital</Label>
              <Select value={selectedHospId} onValueChange={setSelectedHospId}>
                <SelectTrigger className="h-9 w-full sm:w-[260px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {hospitals.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full sm:w-64 mt-1 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </Card>
      )}

      {hospitalId && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="h-9 text-xs gap-1">
            <PlusCircle className="size-3.5" />
            Add Department
          </Button>
        </div>
      )}

      {/* Add Form Panel */}
      {showAddForm && (
        <Card className="border border-border animate-fadeIn">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">New Department Requisition</CardTitle>
            <CardDescription className="text-xs">
              Establish a new clinical branch within the chosen hospital structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAddDept} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Department Name</Label>
                  <Input
                    placeholder="e.g. Cardiology Unit"
                    className="text-xs h-9"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Head of Department (HoD)</Label>
                  <Input
                    placeholder="e.g. Dr. Arthur Vance"
                    className="text-xs h-9"
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs font-semibold">Allocated Clinicians/Staff</Label>
                <Input
                  type="number"
                  min={1}
                  className="text-xs h-9"
                  value={newStaffCount}
                  onChange={(e) => setNewStaffCount(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddForm(false)} className="text-xs h-8">
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="text-xs h-8">
                  Create Department
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Departments Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitalDepts.length > 0 ? (
          hospitalDepts.map((dept) => (
            <Card key={dept.id} className="border border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">{dept.name}</CardTitle>
                  <CardDescription className="text-[10px] font-mono mt-0.5">ID: {dept.id}</CardDescription>
                </div>
                <Badge variant="outline" className={`text-[9px] h-4.5 font-bold ${
                  dept.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                }`}>
                  {dept.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chief of Staff (HoD):</span>
                    <strong className="text-foreground">{dept.headOfDepartment}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="size-3.5" /> Staff Assigned:</span>
                    <strong className="text-foreground">{dept.staffCount} clinicians</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Stethoscope className="size-3.5" /> Physical Bed Count:</span>
                    <strong className="text-foreground">{dept.bedCount} beds</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(dept)} className="h-7 text-[10px] text-primary gap-1">
                    <Edit3 className="size-3" />
                    Edit Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full border border-dashed border-border p-12 text-center text-muted-foreground text-xs italic">
            No departments defined for this hospital branch.
          </div>
        )}
      </div>

      {/* Edit Department Modal Dialog */}
      {editDeptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full bg-card border border-border">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold">Edit Department Stats ({editName})</CardTitle>
              <CardDescription className="text-xs">
                Update staffing or allocated beds for this department.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Chief of Staff (HoD)</Label>
                  <Input
                    className="text-xs h-8"
                    value={editHead}
                    onChange={(e) => setEditHead(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <Label className="text-xs font-semibold">Active Clinicians Count</Label>
                  <Input
                    type="number"
                    className="text-xs h-8"
                    value={editStaffCount}
                    onChange={(e) => setEditStaffCount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Operating Status</Label>
                  <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditDeptId(null)} className="h-8 text-xs">
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
