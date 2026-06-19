import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Landmark, CheckCircle, AlertTriangle, Edit3, DollarSign, Eye, ShieldCheck, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PAYROLL_RECORDS, processPayrollPay, updateStaffMember } from "@/mocks/staff";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/staff/payroll")({
  head: () => ({ meta: [{ title: "Staff Payroll Registry — HMS" }] }),
  component: StaffPayrollPage,
});

function StaffPayrollPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Edit salary form states
  const [basic, setBasic] = useState<number>(0);
  const [allowance, setAllowance] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  // Check user role for edit access (Admins only)
  const user = useAuthStore((s) => s.user);
  const isAuthorized = user?.role === "super_admin" || user?.role === "hospital_admin";

  const handleDisbursePay = (id: string) => {
    if (!isAuthorized) {
      toast.error("Unauthorized Action", {
        description: "Only Hospital Admins can disburse payroll payouts.",
      });
      return;
    }

    const pr = processPayrollPay(id);
    if (pr) {
      toast.success("Payout Cleared!", {
        description: `Salary disbursed to ${pr.staffName} for ${pr.month}.`,
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const startEditSalary = (pr: typeof PAYROLL_RECORDS[0]) => {
    if (!isAuthorized) {
      toast.error("Unauthorized", {
        description: "Only Hospital Admins are allowed to edit compensation brackets.",
      });
      return;
    }

    setSelectedRecordId(pr.id);
    setBasic(pr.basicSalary);
    setAllowance(pr.allowance);
    setDeductions(pr.deductions);
    setBonus(pr.bonus);
  };

  const handleSaveSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) return;

    const pr = PAYROLL_RECORDS.find((p) => p.id === selectedRecordId);
    if (!pr) return;

    pr.basicSalary = basic;
    pr.allowance = allowance;
    pr.deductions = deductions;
    pr.bonus = bonus;
    pr.netPay = basic + allowance + bonus - deductions;

    // Update staff base salary in STAFF mock too
    updateStaffMember(pr.staffId, { salary: basic });

    toast.success("Compensation Updated!", {
      description: `New net pay for ${pr.staffName} is ${formatCurrency(pr.netPay)}.`,
    });

    setSelectedRecordId(null);
    setRefreshKey((k) => k + 1);
  };

  // Math summary
  const totalLiability = PAYROLL_RECORDS.reduce((acc, pr) => acc + pr.netPay, 0);
  const totalPaid = PAYROLL_RECORDS.filter((p) => p.status === "Paid").reduce((acc, pr) => acc + pr.netPay, 0);
  const totalUnpaid = PAYROLL_RECORDS.filter((p) => p.status === "Unpaid").reduce((acc, pr) => acc + pr.netPay, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link to="/staff" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" /> Back to Staff Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="size-6 text-primary" />
            Staff Payroll Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Audit monthly base salaries, calculate tax & PF deductions, and disburse bank payout files.
          </p>
        </div>
        <div>
          {!isAuthorized && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-semibold border border-yellow-500/20">
              <Eye className="size-4" />
              View-Only Staff Access
            </div>
          )}
          {isAuthorized && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="size-4" />
              Admin Editing Clearance
            </div>
          )}
        </div>
      </div>

      {/* Finance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Monthly Liability</span>
              <p className="text-2xl font-bold mt-1 text-foreground">{formatCurrency(totalLiability)}</p>
            </div>
            <DollarSign className="size-7 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Disbursed (Paid)</span>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(totalPaid)}</p>
            </div>
            <CheckCircle className="size-7 text-emerald-500/80" />
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Outstanding (Unpaid)</span>
              <p className="text-2xl font-bold mt-1 text-rose-600">{formatCurrency(totalUnpaid)}</p>
            </div>
            <AlertTriangle className="size-7 text-rose-500/80" />
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Compensation Registry (June 2026)</CardTitle>
          <CardDescription className="text-xs">
            Review basic earnings, mandatory tax deductions, monthly bonuses, and net disbursable pay.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Staff Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Basic (₹)</th>
                  <th className="p-3 text-right">Allowance (₹)</th>
                  <th className="p-3 text-right">Deductions (₹)</th>
                  <th className="p-3 text-right">Bonus (₹)</th>
                  <th className="p-3 text-right font-bold text-foreground">Net Pay (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PAYROLL_RECORDS.length > 0 ? (
                  PAYROLL_RECORDS.map((pr) => {
                    const statusClass = pr.status === "Paid" 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20";
                    
                    return (
                      <tr key={pr.id} className="hover:bg-accent/5 align-middle">
                        <td className="p-3 pl-4 font-semibold text-foreground">{pr.staffName}</td>
                        <td className="p-3 text-muted-foreground">{pr.role}</td>
                        <td className="p-3 text-right font-mono">{formatCurrency(pr.basicSalary)}</td>
                        <td className="p-3 text-right font-mono text-emerald-600">+{formatCurrency(pr.allowance)}</td>
                        <td className="p-3 text-right font-mono text-rose-600">-{formatCurrency(pr.deductions)}</td>
                        <td className="p-3 text-right font-mono text-emerald-600">+{formatCurrency(pr.bonus)}</td>
                        <td className="p-3 text-right font-mono font-bold text-foreground">{formatCurrency(pr.netPay)}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={`text-[9px] h-5 ${statusClass}`}>
                            {pr.status}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {pr.status === "Unpaid" && isAuthorized ? (
                              <Button
                                size="sm"
                                onClick={() => handleDisbursePay(pr.id)}
                                className="h-7 text-[10px] px-2.5 bg-emerald-600 hover:bg-emerald-700"
                              >
                                Disburse
                              </Button>
                            ) : null}

                            {isAuthorized ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditSalary(pr)}
                                className="h-7 text-[10px] gap-1 px-2.5"
                              >
                                <Edit3 className="size-3" />
                                Edit
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">None</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground italic">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Salary Modal */}
      {selectedRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="max-w-md w-full bg-card border border-border">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Edit Compensation Bracket</CardTitle>
                <CardDescription className="text-[10px]">Alter salary terms for selected staff member.</CardDescription>
              </div>
              <button onClick={() => setSelectedRecordId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSaveSalarySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Basic Salary (₹)</Label>
                    <Input
                      type="number"
                      className="text-xs h-9"
                      value={basic}
                      onChange={(e) => setBasic(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Allowance (HRA/Med) (₹)</Label>
                    <Input
                      type="number"
                      className="text-xs h-9"
                      value={allowance}
                      onChange={(e) => setAllowance(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Deductions (Tax/PF) (₹)</Label>
                    <Input
                      type="number"
                      className="text-xs h-9"
                      value={deductions}
                      onChange={(e) => setDeductions(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Monthly Bonus (₹)</Label>
                    <Input
                      type="number"
                      className="text-xs h-9"
                      value={bonus}
                      onChange={(e) => setBonus(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedRecordId(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Save Compensation
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
