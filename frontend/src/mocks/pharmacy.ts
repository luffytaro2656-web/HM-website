import { PATIENTS, PRESCRIPTIONS, Prescription } from "./patients";
import { INVENTORY } from "./inventory";

export interface DispensedMedicine {
  name: string;
  qtyPrescribed: number;
  qtyDispensed: number;
  batchNumber: string;
  expiryDate: string;
}

export interface DispensingRecord {
  id: string;
  prescriptionId: string;
  dispensedDate: string;
  patientId: string;
  doctorId: string;
  medicines: DispensedMedicine[];
  status: "Completed" | "Partial";
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  medicineName: string;
  category: string;
  qty: number;
  batchNumber: string;
  expiryDate: string;
  supplierName: string;
  purchaseDate: string;
  cost: number;
}

// Global mutable lists for pharmacy operations
export let DISPENSING_LOGS: DispensingRecord[] = [];
export let PURCHASES: PurchaseRecord[] = [];

// Pre-fill some past dispensing records
PRESCRIPTIONS.slice(20, 40).forEach((pr, idx) => {
  const patient = PATIENTS.find(p => p.id === pr.patientId);
  const qty = 5 + (idx % 3) * 5;
  DISPENSING_LOGS.push({
    id: `DSP-${1000 + idx}`,
    prescriptionId: pr.id,
    dispensedDate: new Date(Date.now() - (idx % 5) * 86400000).toISOString(),
    patientId: pr.patientId,
    doctorId: pr.doctorId,
    medicines: [
      {
        name: pr.medicine,
        qtyPrescribed: qty,
        qtyDispensed: qty,
        batchNumber: `BAT-${900 + idx}`,
        expiryDate: new Date(Date.now() + (120 + idx * 30) * 86400000).toISOString().slice(0, 10)
      }
    ],
    status: "Completed",
    notes: "Dispensed full prescription course."
  });
});

// Pre-fill some purchases/restocks
const SUPPLIERS = ["AstraZeneca Pharma", "Pfizer Ltd", "Sun Pharmaceuticals", "Cipla Ltd", "Reddy's Laboratories"];
Array.from({ length: 15 }).forEach((_, idx) => {
  const medicineName = ["Paracetamol 500mg", "Amoxicillin 250mg", "Insulin Pen", "Metformin 500mg", "Atorvastatin 20mg"][idx % 5];
  const qty = 100 + (idx * 50);
  const cost = qty * 4.5;
  PURCHASES.push({
    id: `PUR-${1000 + idx}`,
    medicineName,
    category: "Medicine",
    qty,
    batchNumber: `BAT-PUR-${800 + idx}`,
    expiryDate: new Date(Date.now() + (360 + idx * 45) * 86400000).toISOString().slice(0, 10),
    supplierName: SUPPLIERS[idx % SUPPLIERS.length],
    purchaseDate: new Date(Date.now() - (idx % 10) * 86400000).toISOString(),
    cost
  });
});

// Helpers & Mutators
export function dispensePrescription(
  prescriptionId: string,
  medicines: DispensedMedicine[],
  status: "Completed" | "Partial",
  notes?: string
) {
  const pr = PRESCRIPTIONS.find(p => p.id === prescriptionId);
  if (!pr) return null;

  // Mutate inventory levels for each medicine dispensed
  medicines.forEach((med) => {
    // Find matching inventory medicine (exact name matching, case insensitive)
    const invItem = INVENTORY.find(
      (item) => item.name.toLowerCase() === med.name.toLowerCase() || item.name.toLowerCase().includes(med.name.toLowerCase())
    );
    if (invItem) {
      invItem.quantity = Math.max(0, invItem.quantity - med.qtyDispensed);
    }
  });

  const record: DispensingRecord = {
    id: `DSP-${Date.now()}`,
    prescriptionId,
    dispensedDate: new Date().toISOString(),
    patientId: pr.patientId,
    doctorId: pr.doctorId,
    medicines,
    status,
    notes
  };

  DISPENSING_LOGS.unshift(record);
  return record;
}

export function handleMedicineReturn(
  patientId: string,
  medicineName: string,
  qty: number,
  notes?: string
) {
  const invItem = INVENTORY.find(
    (item) => item.name.toLowerCase() === medicineName.toLowerCase() || item.name.toLowerCase().includes(medicineName.toLowerCase())
  );
  if (invItem) {
    invItem.quantity += qty;
  }

  // Create a record in Dispensing Logs with negative quantity to signify a return
  const record: DispensingRecord = {
    id: `RET-${Date.now()}`,
    prescriptionId: "N/A - Return",
    dispensedDate: new Date().toISOString(),
    patientId,
    doctorId: "Returned",
    medicines: [
      {
        name: medicineName,
        qtyPrescribed: 0,
        qtyDispensed: -qty, // negative to show returns
        batchNumber: "RET-BATCH",
        expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10)
      }
    ],
    status: "Completed",
    notes: `Customer Return: ${notes || "No notes"}`
  };

  DISPENSING_LOGS.unshift(record);
  return record;
}

export function addPurchaseRecord(
  medicineName: string,
  qty: number,
  batchNumber: string,
  expiryDate: string,
  supplierName: string,
  cost: number
) {
  // Update inventory level or create item
  const invItem = INVENTORY.find(
    (item) => item.name.toLowerCase() === medicineName.toLowerCase()
  );

  if (invItem) {
    invItem.quantity += qty;
    invItem.expiryDate = expiryDate; // Update with latest batch expiry
  } else {
    // Register new item into INVENTORY list
    INVENTORY.push({
      id: `INV-${String(INVENTORY.length + 1).padStart(4, "0")}`,
      name: medicineName,
      category: "Medicine",
      hospitalId: "H1",
      quantity: qty,
      unit: "Strip",
      expiryDate,
      reorderLevel: 50
    });
  }

  const record: PurchaseRecord = {
    id: `PUR-${Date.now()}`,
    medicineName,
    category: "Medicine",
    qty,
    batchNumber,
    expiryDate,
    supplierName,
    purchaseDate: new Date().toISOString(),
    cost
  };

  PURCHASES.unshift(record);
  return record;
}
