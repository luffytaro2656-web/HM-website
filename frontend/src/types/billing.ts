export type PaymentStatus = "Paid" | "Pending" | "Partial" | "Overdue";

export interface InvoiceLineItem {
  description: string;
  qty: number;
  rate: number;
  gstPct: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  hospitalId: string;
  items: InvoiceLineItem[];
  total: number;
  paid: number;
  balance: number;
  status: PaymentStatus;
  date: string;
  insuranceProvider?: string;
  policyNumber?: string;
  claimStatus?: "Not Filed" | "Pending" | "Approved" | "Rejected";
  claimAmount?: number;
  refundReason?: string;
  refundAmount?: number;
  refundDate?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  patientName: string;
  amount: number;
  paymentMode: "Cash" | "Card" | "UPI" | "Insurance";
  transactionRef: string;
  date: string;
}
