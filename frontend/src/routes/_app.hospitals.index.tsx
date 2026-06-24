import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, BedDouble, Users, Plus, Search, Building2, Phone, ShieldCheck, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RegisterHospitalForm } from "@/components/modules/hospitals/RegisterHospitalForm";
import { RegisterHospitalFormValues } from "@/types/hospital";
import { getHospitalsData, createHospitalRequest } from "@/lib/api/hospitals";

export const Route = createFileRoute("/_app/hospitals/")({
  head: () => ({ meta: [{ title: "Hospitals branches — HMS" }] }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  // Add Hospital Dialog states
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: getHospitalsData,
  });

  const registerHospitalMutation = useMutation({
    mutationFn: createHospitalRequest,
    onSuccess: (newHospital, variables) => {
      toast.success("Hospital Branch Registered!", {
        description: `${variables.name} in ${variables.city} has been successfully added to the branch network.`,
      });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
    onError: (error: any) => {
      console.error("Failed to create hospital branch:", error);
      toast.error("Failed to register hospital branch", {
        description: error.message || "Something went wrong.",
      });
    },
  });

  const filtered = hospitals.filter(
    (h) => h.name.toLowerCase().includes(query.toLowerCase()) || h.city.toLowerCase().includes(query.toLowerCase()),
  );

  const handleAddHospitalSubmit = async (data: RegisterHospitalFormValues) => {
    registerHospitalMutation.mutate({
      name: data.name,
      city: data.city,
      address: data.address,
      contact: data.contact,
      totalBeds: data.totalBeds,
      operatingHours: data.operatingHours,
      status: data.status,
      facilities: data.facilities,
      departments: data.departments,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            Branch Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Central monitoring directory across all {hospitals.length} partner branches and healthcare facilities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/hospitals/departments">
            <Button size="sm" variant="outline" className="text-xs h-9">
              Department Registry
            </Button>
          </Link>
          <Link to="/hospitals/beds">
            <Button size="sm" variant="outline" className="text-xs h-9">
              Beds Status Grid
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowAddForm(true)} className="text-xs h-9 gap-1.5">
            <Plus className="size-4" />
            Add Hospital
          </Button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Branches</span>
            <p className="text-2xl font-bold mt-1">{hospitals.length}</p>
            <span className="text-[9px] text-emerald-600 font-medium mt-0.5 block">Active network locations</span>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Network Beds</span>
            <p className="text-2xl font-bold mt-1">
              {hospitals.reduce((acc, h) => acc + h.totalBeds, 0)}
            </p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Across ICU and general wards</span>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Network Doctors</span>
            <p className="text-2xl font-bold mt-1">
              {hospitals.reduce((acc, h) => acc + (h.totalDoctors || 0), 0)}
            </p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">On duty today</span>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active Patients</span>
            <p className="text-2xl font-bold mt-1">
              {hospitals.reduce((acc, h) => acc + (h.totalPatients || 0), 0)}
            </p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Outpatient + admitted</span>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search hospitals or cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Grid of Hospital Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border bg-card rounded-xl p-5 animate-pulse flex flex-col justify-between h-[200px]">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-5 bg-muted rounded w-12"></div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
              <div className="h-8 bg-muted rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => {
            const occ = Math.round((h.occupiedBeds / h.totalBeds) * 100);
            return (
              <div
                key={h.id}
                className="group border border-border bg-card rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {h.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="size-3 text-primary" /> {h.city}
                      </p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-3.5 text-center text-xs">
                    <div>
                      <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                        <BedDouble className="size-3" />
                        Beds
                      </p>
                      <p className="mt-1 font-semibold">{h.totalBeds}</p>
                      <p className="text-[9px] text-muted-foreground">{occ}% used</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Doctors</p>
                      <p className="mt-1 font-semibold">{h.totalDoctors}</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                        <Users className="size-3" />
                        Patients
                      </p>
                      <p className="mt-1 font-semibold">{h.totalPatients}</p>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/hospitals/$id"
                  params={{ id: h.id }}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  View Branch Profile
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground text-xs italic">
          No hospital branches found. Click "Add Hospital" to register one.
        </div>
      )}

      {/* Add Hospital Dialog Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <RegisterHospitalForm
            onSubmit={handleAddHospitalSubmit}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

    </div>
  );
}
