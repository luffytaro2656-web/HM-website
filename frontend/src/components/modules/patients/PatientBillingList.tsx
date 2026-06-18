import React from "react";
import { Receipt, Calendar, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INVOICES } from "@/mocks/billing";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatCurrency } from "@/utils/formatters";
import type { Patient } from "@/types/patient";

interface PatientBillingListProps {
  patient: Patient;
}

export function PatientBillingList({ patient }: PatientBillingListProps) {
  const patientInvoices = INVOICES.filter((inv) => inv.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (patientInvoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
        No billing records found for this patient.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Invoiced</p>
          <h4 className="text-xl font-bold mt-1 text-foreground">
            {formatCurrency(patientInvoices.reduce((sum, inv) => sum + inv.total, 0))}
          </h4>
        </div>
        <div className="rounded-lg border p-4 bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Paid</p>
          <h4 className="text-xl font-bold mt-1 text-success-foreground">
            {formatCurrency(patientInvoices.reduce((sum, inv) => sum + inv.paid, 0))}
          </h4>
        </div>
        <div className="rounded-lg border p-4 bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Outstanding</p>
          <h4 className="text-xl font-bold mt-1 text-danger">
            {formatCurrency(patientInvoices.reduce((sum, inv) => sum + inv.balance, 0))}
          </h4>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead className="text-right">Balance Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patientInvoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-muted/10">
                <TableCell className="font-mono text-xs font-semibold text-primary">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="size-3.5 text-primary shrink-0" />
                    <span>{inv.id}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>{formatDate(inv.date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-xs font-medium">{formatCurrency(inv.total)}</TableCell>
                <TableCell className="text-xs text-success">{formatCurrency(inv.paid)}</TableCell>
                <TableCell className="text-right text-xs font-bold text-foreground">
                  {formatCurrency(inv.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
