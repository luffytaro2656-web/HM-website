import type { Hospital } from "@/types/hospital";

const cities = [
  "Chennai", "Coimbatore", "Madurai", "Salem", "Trichy",
  "Vellore", "Tirunelveli", "Erode", "Tiruppur", "Thanjavur",
  "Dindigul", "Kanchipuram", "Cuddalore", "Karur", "Nagercoil",
  "Hosur", "Pollachi", "Rajapalayam", "Sivakasi", "Kumbakonam",
];

const names = [
  "Apollo", "Fortis", "MedPlus", "Sundaram", "Kauvery",
  "Vijaya", "Lifeline", "Bharathi", "Meenakshi", "Annai",
  "Sri Ramachandra", "MIOT", "Global", "Frontier", "Velammal",
  "GEM", "PSG", "KMCH", "Aravind", "Christian Medical",
];

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  headOfDepartment: string;
  staffCount: number;
  bedCount: number;
  status: "Active" | "Inactive";
}

export interface HospitalBed {
  id: string; // e.g. "B-101"
  hospitalId: string;
  wardName: string;
  category: "General" | "ICU" | "Private";
  status: "Available" | "Occupied" | "Maintenance";
  notes?: string;
}

// Generate the base hospitals with additional facilities and operating hours
export let HOSPITALS: Hospital[] = Array.from({ length: 20 }, (_, i) => {
  const totalBeds = 120 + ((i * 17) % 280);
  const occupiedBeds = Math.floor(totalBeds * (0.45 + ((i * 7) % 40) / 100));
  
  const id = `H${String(i + 1).padStart(3, "0")}`;
  
  return {
    id,
    name: `${names[i]} Hospital`,
    city: cities[i],
    address: `${100 + i * 7}, ${cities[i]} Main Road, Tamil Nadu`,
    contact: `+91 ${9000000000 + i * 123457}`,
    totalBeds,
    occupiedBeds,
    totalDoctors: 18 + ((i * 5) % 40),
    totalPatients: 200 + ((i * 37) % 600),
    revenueThisMonth: 1800000 + ((i * 432109) % 5000000),
    status: i === 17 ? "Inactive" : "Active",
    // Expanded optional fields
    facilities: ["OPD Desk", "ICU Ward", "Diagnostic Laboratory", "24/7 Emergency Care", "Ambulance fleet"] as string[],
    operatingHours: "24/7 Fully Operational" as string
  } as any; // Cast so TS accepts custom fields
});

// Generate Departments across all 20 hospitals
export let DEPARTMENTS: Department[] = [];
HOSPITALS.forEach((hospital) => {
  const deptNames = ["Outpatient (OPD)", "ICU Unit", "Surgical Department", "Pharmacy", "Laboratory Desk", "Emergency Services"];
  const heads = ["Dr. Vignesh", "Dr. Shalini", "Dr. Karthik", "Ravi Kumar", "Sarah Jenkins", "Dr. Rajesh"];
  
  deptNames.forEach((name, idx) => {
    DEPARTMENTS.push({
      id: `DEP-${hospital.id}-${idx + 1}`,
      hospitalId: hospital.id,
      name,
      headOfDepartment: heads[idx],
      staffCount: 15 + (idx * 4),
      bedCount: 10 + (idx * 5),
      status: "Active"
    });
  });
});

// Generate Beds across all 20 hospitals
export let HOSPITAL_BEDS: HospitalBed[] = [];
HOSPITALS.forEach((hospital) => {
  const wards = [
    { name: "General Ward A", cat: "General" },
    { name: "ICU Wing", cat: "ICU" },
    { name: "Private Suite B", cat: "Private" }
  ];
  
  wards.forEach((w, wIdx) => {
    for (let i = 1; i <= 10; i++) {
      const status = (i % 4 === 0) ? "Maintenance" : (i % 3 === 0) ? "Occupied" : "Available";
      HOSPITAL_BEDS.push({
        id: `BED-${wIdx + 1}${String(i).padStart(2, "0")}`,
        hospitalId: hospital.id,
        wardName: w.name,
        category: w.cat as HospitalBed["category"],
        status,
        notes: status === "Maintenance" ? "Deep sanitization in progress." : "Ready for clinical intake."
      });
    }
  });
});

export function getHospital(id: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}

// Mutators
export function updateHospitalProfile(
  id: string,
  name: string,
  city: string,
  address: string,
  contact: string,
  facilities: string[],
  operatingHours: string,
  status: "Active" | "Inactive"
) {
  const hosp = HOSPITALS.find(h => h.id === id);
  if (!hosp) return null;

  hosp.name = name;
  hosp.city = city;
  hosp.address = address;
  hosp.contact = contact;
  hosp.status = status;
  (hosp as any).facilities = facilities;
  (hosp as any).operatingHours = operatingHours;

  return hosp;
}

export function addDepartment(
  hospitalId: string,
  name: string,
  headOfDepartment: string,
  staffCount: number,
  bedCount: number
) {
  const newDept: Department = {
    id: `DEP-${hospitalId}-${Date.now()}`,
    hospitalId,
    name,
    headOfDepartment,
    staffCount,
    bedCount,
    status: "Active"
  };

  DEPARTMENTS.unshift(newDept);
  return newDept;
}

export function updateDepartment(
  deptId: string,
  name: string,
  headOfDepartment: string,
  staffCount: number,
  bedCount: number,
  status: "Active" | "Inactive"
) {
  const dept = DEPARTMENTS.find(d => d.id === deptId);
  if (!dept) return null;

  dept.name = name;
  dept.headOfDepartment = headOfDepartment;
  dept.staffCount = staffCount;
  dept.bedCount = bedCount;
  dept.status = status;

  return dept;
}

export function addHospitalBed(
  hospitalId: string,
  wardName: string,
  category: HospitalBed["category"],
  status: HospitalBed["status"],
  notes?: string
) {
  const hosp = HOSPITALS.find(h => h.id === hospitalId);
  if (!hosp) return null;

  // Calculate new ID based on existing beds count for the hospital
  const count = HOSPITAL_BEDS.filter(b => b.hospitalId === hospitalId).length;
  const bedId = `BED-${String(count + 1).padStart(3, "0")}`;

  const newBed: HospitalBed = {
    id: bedId,
    hospitalId,
    wardName,
    category,
    status,
    notes
  };

  HOSPITAL_BEDS.unshift(newBed);
  
  // Update totals
  hosp.totalBeds += 1;
  if (status === "Occupied") hosp.occupiedBeds += 1;

  return newBed;
}

export function updateHospitalBedStatus(
  hospitalId: string,
  bedId: string,
  status: HospitalBed["status"],
  notes?: string
) {
  const bed = HOSPITAL_BEDS.find(b => b.hospitalId === hospitalId && b.id === bedId);
  const hosp = HOSPITALS.find(h => h.id === hospitalId);
  
  if (!bed || !hosp) return null;

  const oldStatus = bed.status;
  bed.status = status;
  if (notes) bed.notes = notes;

  // Sync hospital counters
  if (oldStatus !== "Occupied" && status === "Occupied") {
    hosp.occupiedBeds = Math.min(hosp.totalBeds, hosp.occupiedBeds + 1);
  } else if (oldStatus === "Occupied" && status !== "Occupied") {
    hosp.occupiedBeds = Math.max(0, hosp.occupiedBeds - 1);
  }

  return bed;
}
