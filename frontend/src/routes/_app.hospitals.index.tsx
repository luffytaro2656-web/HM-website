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
import { HOSPITALS } from "@/mocks/hospitals";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/hospitals/")({
  head: () => ({ meta: [{ title: "Hospitals branches — HMS" }] }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Add Hospital Dialog states
  const [showAddForm, setShowAddForm] = useState(false);
  const [hospName, setHospName] = useState("");
  const [hospCity, setHospCity] = useState("Chennai");
  const [hospAddress, setHospAddress] = useState("");
  const [hospContact, setHospContact] = useState("");
  const [hospBeds, setHospBeds] = useState<number>(150);

  const filtered = HOSPITALS.filter(
    (h) => h.name.toLowerCase().includes(query.toLowerCase()) || h.city.toLowerCase().includes(query.toLowerCase()),
  );

  const handleAddHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospAddress || !hospContact) {
      toast.error("Please fill in all details for the new hospital branch");
      return;
    }

    const newHosp = {
      id: `H${String(HOSPITALS.length + 1).padStart(3, "0")}`,
      name: hospName,
      city: hospCity,
      address: hospAddress,
      contact: hospContact,
      totalBeds: hospBeds,
      occupiedBeds: 0,
      totalDoctors: 5,
      totalPatients: 0,
      revenueThisMonth: 0,
      status: "Active" as const,
      facilities: ["OPD Desk", "24/7 Emergency Care"],
      operatingHours: "24/7 Fully Operational"
    };

    HOSPITALS.push(newHosp);
    toast.success("Hospital Branch Registered!", {
      description: `${hospName} in ${hospCity} has been successfully added to the branch network.`,
    });

    // Reset
    setHospName("");
    setHospAddress("");
    setHospContact("");
    setHospBeds(150);
    setShowAddForm(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            Branch Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Central monitoring directory across all {HOSPITALS.length} partner branches and healthcare facilities.
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
            <p className="text-2xl font-bold mt-1">{HOSPITALS.length}</p>
            <span className="text-[9px] text-emerald-600 font-medium mt-0.5 block">Active network locations</span>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Network Beds</span>
            <p className="text-2xl font-bold mt-1">
              {HOSPITALS.reduce((acc, h) => acc + h.totalBeds, 0)}
            </p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Across ICU and general wards</span>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Network Doctors</span>
            <p className="text-2xl font-bold mt-1">
              {HOSPITALS.reduce((acc, h) => acc + h.totalDoctors, 0)}
            </p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">On duty today</span>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active Patients</span>
            <p className="text-2xl font-bold mt-1">
              {HOSPITALS.reduce((acc, h) => acc + h.totalPatients, 0)}
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

      {/* Add Hospital Dialog Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full bg-card border border-border">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-sm font-bold">Register Hospital Branch</CardTitle>
                <p className="text-[10px] text-muted-foreground">Add location details for branch tracking.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAddHospitalSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hospital Name</Label>
                  <Input
                    placeholder="e.g. Kauvery Specialized Hospital"
                    className="text-xs h-9"
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">City Location</Label>
                    <Select value={hospCity} onValueChange={setHospCity}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                        <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                        <SelectItem value="Madurai">Madurai</SelectItem>
                        <SelectItem value="Salem">Salem</SelectItem>
                        <SelectItem value="Trichy">Trichy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Beds Capacity</Label>
                    <Input
                      type="number"
                      className="text-xs h-9"
                      value={hospBeds}
                      onChange={(e) => setHospBeds(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Detailed Street Address</Label>
                  <Input
                    placeholder="e.g. 12, Kauvery Main Rd, Alwarpet"
                    className="text-xs h-9"
                    value={hospAddress}
                    onChange={(e) => setHospAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Helpline Contact</Label>
                  <Input
                    placeholder="e.g. +91 9876543210"
                    className="text-xs h-9"
                    value={hospContact}
                    onChange={(e) => setHospContact(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddForm(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Register Branch
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
