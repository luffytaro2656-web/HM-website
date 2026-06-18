import type { Invoice, PaymentStatus, PaymentRecord, InvoiceLineItem } from "@/types/billing";
import { PATIENTS } from "./patients";

const SERVICES = [
  { description: "Consultation Fee", rate: 800, gstPct: 18 },
  { description: "Blood Test (CBC)", rate: 450, gstPct: 12 },
  { description: "X-Ray Chest", rate: 1200, gstPct: 18 },
  { description: "ECG", rate: 600, gstPct: 12 },
  { description: "Ultrasound Abdomen", rate: 2500, gstPct: 18 },
  { description: "Room Charges (per day)", rate: 3500, gstPct: 12 },
  { description: "Medication", rate: 1800, gstPct: 12 },
  { description: "Surgical Procedure", rate: 25000, gstPct: 18 },
];

const STATUSES: PaymentStatus[] = ["Paid", "Pending", "Partial", "Overdue"];
const PROVIDERS = ["Apollo Municipal Insurance", "Star Health Allied", "ICICI Lombard", "HDFC ERGO"];

// Generate mock invoices with insurance parameters
export const INVOICES: Invoice[] = Array.from({ length: 80 }, (_, i) => {
  const patient = PATIENTS[i % PATIENTS.length];
  const itemCount = 2 + (i % 4);
  const items = Array.from({ length: itemCount }, (_, j) => {
    const s = SERVICES[(i + j) % SERVICES.length];
    return { ...s, qty: 1 + ((i + j) % 3) };
  });

  const total = items.reduce((sum, it) => sum + it.rate * it.qty * (1 + it.gstPct / 100), 0);
  const status = STATUSES[i % STATUSES.length];
  const paid = status === "Paid" ? total : status === "Partial" ? total * 0.5 : 0;
  
  // Set up insurance for a subset
  const hasInsurance = i % 3 === 0;
  const claimStatus = hasInsurance 
    ? (status === "Paid" ? "Approved" : i % 2 === 0 ? "Pending" : "Not Filed") as any
    : undefined;

  return {
    id: `INV-2024-${String(i + 1).padStart(5, "0")}`,
    patientId: patient.id,
    hospitalId: patient.hospitalId,
    items,
    total: Math.round(total),
    paid: Math.round(paid),
    balance: Math.round(total - paid),
    status,
    date: new Date(Date.now() - (i * 86400000) % (90 * 86400000)).toISOString().slice(0, 10),
    insuranceProvider: hasInsurance ? PROVIDERS[i % PROVIDERS.length] : undefined,
    policyNumber: hasInsurance ? `POL-887-${String(10000 + i * 47)}` : undefined,
    claimStatus,
    claimAmount: hasInsurance ? Math.round(total * 0.8) : undefined,
  };
});

// Generate initial payments list
export const PAYMENTS: PaymentRecord[] = [];

INVOICES.forEach((inv, i) => {
  if (inv.paid > 0) {
    const patientName = PATIENTS.find((p) => p.id === inv.patientId)?.name || "Patient";
    const modes = ["Cash", "Card", "UPI", "Insurance"] as const;
    PAYMENTS.push({
      id: `PAY-${String(PAYMENTS.length + 1).padStart(5, "0")}`,
      invoiceId: inv.id,
      patientName,
      amount: inv.paid,
      paymentMode: modes[i % modes.length],
      transactionRef: `TXN-${String(100000 + i * 143)}`,
      date: inv.date,
    });
  }
});

// Mutators
export function getInvoice(id: string): Invoice | undefined {
  return INVOICES.find((i) => i.id === id);
}

export function addInvoice(patientId: string, hospitalId: string, items: InvoiceLineItem[], insurance?: { provider: string, policy: string, claimAmount: number }): Invoice {
  const newId = `INV-2024-${String(INVOICES.length + 1).padStart(5, "0")}`;
  const total = items.reduce((sum, it) => sum + it.rate * it.qty * (1 + it.gstPct / 100), 0);
  
  const newInv: Invoice = {
    id: newId,
    patientId,
    hospitalId,
    items,
    total: Math.round(total),
    paid: 0,
    balance: Math.round(total),
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
    insuranceProvider: insurance?.provider,
    policyNumber: insurance?.policy,
    claimStatus: insurance ? "Pending" : undefined,
    claimAmount: insurance?.claimAmount,
  };

  INVOICES.unshift(newInv);
  return newInv;
}

export function recordPayment(invoiceId: string, amount: number, paymentMode: "Cash" | "Card" | "UPI" | "Insurance", transactionRef: string): PaymentRecord | null {
  const inv = getInvoice(invoiceId);
  if (!inv) return null;

  const patientName = PATIENTS.find((p) => p.id === inv.patientId)?.name || "Patient";

  const newPayment: PaymentRecord = {
    id: `PAY-${String(PAYMENTS.length + 1).padStart(5, "0")}`,
    invoiceId,
    patientName,
    amount,
    paymentMode,
    transactionRef,
    date: new Date().toISOString().slice(0, 10),
  };

  PAYMENTS.unshift(newPayment);

  // Update invoice paid amounts and balance
  inv.paid = Math.min(inv.total, inv.paid + amount);
  inv.balance = Math.max(0, inv.total - inv.paid);
  
  if (inv.balance === 0) {
    inv.status = "Paid";
    if (inv.claimStatus === "Pending") {
      inv.claimStatus = "Approved";
    }
  } else {
    inv.status = "Partial";
  }

  return newPayment;
}

export function attachInsurance(invoiceId: string, provider: string, policyNumber: string, claimAmount: number): Invoice | null {
  const inv = getInvoice(invoiceId);
  if (!inv) return null;

  inv.insuranceProvider = provider;
  inv.policyNumber = policyNumber;
  inv.claimAmount = claimAmount;
  inv.claimStatus = "Pending";

  return inv;
}

export function updateClaimStatus(invoiceId: string, claimStatus: "Approved" | "Rejected"): Invoice | null {
  const inv = getInvoice(invoiceId);
  if (!inv) return null;

  inv.claimStatus = claimStatus;
  
  if (claimStatus === "Approved" && inv.claimAmount) {
    // Automatically record an insurance payment for the approved claim amount
    recordPayment(invoiceId, inv.claimAmount, "Insurance", `CLAIM-${inv.id}`);
  }

  return inv;
}

export function processRefund(invoiceId: string, refundAmount: number, refundReason: string): Invoice | null {
  const inv = getInvoice(invoiceId);
  if (!inv) return null;

  inv.refundAmount = refundAmount;
  inv.refundReason = refundReason;
  inv.refundDate = new Date().toISOString().slice(0, 10);
  
  // Adjust paid amount and balance
  inv.paid = Math.max(0, inv.paid - refundAmount);
  inv.balance = inv.total - inv.paid;
  inv.status = inv.paid === 0 ? "Pending" : "Partial";

  return inv;
}
