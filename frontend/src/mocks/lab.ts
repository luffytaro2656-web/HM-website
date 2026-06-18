import { PATIENTS } from "./patients";
import { DOCTORS } from "./doctors";

export interface LabTestParameter {
  name: string;
  value: string;
  referenceRange: string;
  unit: string;
  status: "Normal" | "High" | "Low";
}

export interface LabTestOrder {
  id: string;
  patientId: string;
  doctorId: string;
  testType: string;
  urgency: "Routine" | "Urgent" | "STAT";
  notes?: string;
  status: "Order Received" | "Sample Collected" | "In Processing" | "Resulted" | "Released";
  
  // Sample details
  sampleType?: string;
  collectedAt?: string;
  collectorName?: string;
  
  // Results details
  resultedAt?: string;
  technicianName?: string;
  parameters?: LabTestParameter[];
  pdfAttached?: boolean;
  releasedAt?: string;
  verifiedBy?: string;
}

export const LAB_TEST_TYPES = [
  "Complete Blood Count (CBC)",
  "Lipid Profile",
  "Liver Function Test (LFT)",
  "Renal / Kidney Function Test (KFT)",
  "Thyroid Panel (T3, T4, TSH)",
  "Blood Glucose (HbA1c)",
  "Electrolytes Panel",
  "Urine Routine & Microscopy"
];

export let LAB_ORDERS: LabTestOrder[] = [];

// Pre-fill 20 orders at various states
const SAMPLE_TYPES = ["Blood (EDTA)", "Serum", "Plasma", "Urine (Random)"];
const LAB_TECHS = ["Sarah Jenkins", "Robert Chen", "Elena Rostova", "Marcus Vance"];

Array.from({ length: 25 }).forEach((_, idx) => {
  const patient = PATIENTS[idx % PATIENTS.length];
  const doctor = DOCTORS[idx % DOCTORS.length];
  const testType = LAB_TEST_TYPES[idx % LAB_TEST_TYPES.length];
  const urgency = ["Routine", "Urgent", "STAT"][idx % 3] as LabTestOrder["urgency"];
  
  const orderId = `LAB-2024-${String(idx + 1).padStart(5, "0")}`;

  // Distribute statuses across lifecycle
  let status: LabTestOrder["status"] = "Order Received";
  if (idx % 5 === 1) status = "Sample Collected";
  else if (idx % 5 === 2) status = "In Processing";
  else if (idx % 5 === 3) status = "Resulted";
  else if (idx % 5 === 4) status = "Released";

  const orderDate = new Date(Date.now() - (idx % 10) * 86400000 - 3600000).toISOString();

  let order: LabTestOrder = {
    id: orderId,
    patientId: patient.id,
    doctorId: doctor.id,
    testType,
    urgency,
    notes: idx % 4 === 0 ? "Patient fasting for 12 hours prior." : "Standard diagnostic evaluation.",
    status,
  };

  // Add sample collection data if past stage 1
  if (status !== "Order Received") {
    order.sampleType = SAMPLE_TYPES[idx % SAMPLE_TYPES.length];
    order.collectedAt = new Date(new Date(orderDate).getTime() + 1800000).toISOString();
    order.collectorName = ["Staff Nurse Priya", "Collector Selvam", "Nurse Manoj"][idx % 3];
  }

  // Add processing results if Resulted or Released
  if (status === "Resulted" || status === "Released") {
    order.resultedAt = new Date(new Date(orderDate).getTime() + 7200000).toISOString();
    order.technicianName = LAB_TECHS[idx % LAB_TECHS.length];
    order.pdfAttached = idx % 2 === 0;
    
    // Set some structured test parameters
    if (testType.includes("Lipid")) {
      order.parameters = [
        { name: "Total Cholesterol", value: "210", referenceRange: "150 - 200", unit: "mg/dL", status: "High" },
        { name: "HDL Cholesterol", value: "45", referenceRange: "> 40", unit: "mg/dL", status: "Normal" },
        { name: "LDL Cholesterol", value: "142", referenceRange: "< 100", unit: "mg/dL", status: "High" },
        { name: "Triglycerides", value: "155", referenceRange: "< 150", unit: "mg/dL", status: "High" }
      ];
    } else if (testType.includes("Glucose")) {
      order.parameters = [
        { name: "HbA1c (Glycated Hb)", value: "6.2", referenceRange: "4.0 - 5.6", unit: "%", status: "High" },
        { name: "Estimated Average Glucose", value: "126", referenceRange: "70 - 100", unit: "mg/dL", status: "High" }
      ];
    } else {
      // General CBC parameters
      order.parameters = [
        { name: "Hemoglobin", value: "13.8", referenceRange: "12.0 - 16.0", unit: "g/dL", status: "Normal" },
        { name: "WBC Count", value: "8.4", referenceRange: "4.0 - 11.0", unit: "10^3/µL", status: "Normal" },
        { name: "Platelet Count", value: "245", referenceRange: "150 - 450", unit: "10^3/µL", status: "Normal" }
      ];
    }
  }

  // Add verification sign-off if Released
  if (status === "Released") {
    order.releasedAt = new Date(new Date(orderDate).getTime() + 10800000).toISOString();
    order.verifiedBy = ["Chief Pathologist Dr. Bose", "Pathology Head Dr. Kumar"][idx % 2];
  }

  LAB_ORDERS.push(order);
});

// Mutators
export function createLabOrder(
  patientId: string,
  doctorId: string,
  testType: string,
  urgency: LabTestOrder["urgency"],
  notes?: string
) {
  const newOrder: LabTestOrder = {
    id: `LAB-2024-${String(LAB_ORDERS.length + 1).padStart(5, "0")}`,
    patientId,
    doctorId,
    testType,
    urgency,
    notes,
    status: "Order Received"
  };

  LAB_ORDERS.unshift(newOrder);
  return newOrder;
}

export function collectSample(orderId: string, sampleType: string, collectorName: string) {
  const order = LAB_ORDERS.find(o => o.id === orderId);
  if (!order) return null;

  order.status = "Sample Collected";
  order.sampleType = sampleType;
  order.collectedAt = new Date().toISOString();
  order.collectorName = collectorName;

  return order;
}

export function startProcessing(orderId: string) {
  const order = LAB_ORDERS.find(o => o.id === orderId);
  if (!order) return null;

  order.status = "In Processing";
  return order;
}

export function uploadLabResults(
  orderId: string,
  parameters: LabTestParameter[],
  technicianName: string,
  pdfAttached: boolean = false
) {
  const order = LAB_ORDERS.find(o => o.id === orderId);
  if (!order) return null;

  order.status = "Resulted";
  order.resultedAt = new Date().toISOString();
  order.technicianName = technicianName;
  order.parameters = parameters;
  order.pdfAttached = pdfAttached;

  return order;
}

export function releaseLabResults(orderId: string, verifiedBy: string) {
  const order = LAB_ORDERS.find(o => o.id === orderId);
  if (!order) return null;

  order.status = "Released";
  order.releasedAt = new Date().toISOString();
  order.verifiedBy = verifiedBy;

  return order;
}
