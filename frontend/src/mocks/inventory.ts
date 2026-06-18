import type { InventoryItem, InventoryCategory, PurchaseEntry } from "@/types/inventory";
import { HOSPITALS } from "./hospitals";

const SURGICAL = ["Surgical Gloves (M)", "Surgical Mask", "N95 Mask", "Suture Kit", "Scalpel Blade", "Surgical Gauze"];
const CONSUMABLE = ["Cotton Roll", "IV Drip Set", "Syringe 5ml", "Bandage Roll", "Alcohol Swabs"];
const EQUIPMENT = ["Stethoscope", "BP Monitor", "Pulse Oximeter", "Thermometer (Digital)"];

const ALL = [
  ...SURGICAL.map((n) => ({ name: n, category: "Surgical" as InventoryCategory, unit: "Pack" })),
  ...CONSUMABLE.map((n) => ({ name: n, category: "Consumable" as InventoryCategory, unit: "Pack" })),
  ...EQUIPMENT.map((n) => ({ name: n, category: "Equipment" as InventoryCategory, unit: "Unit" })),
];

const SUPPLIERS = [
  { name: "Apex Healthcare Supplies", contact: "+91 9900112233" },
  { name: "MediTech Surgical Products Ltd", contact: "+91 9884011223" },
  { name: "Lifeline Consumables Co.", contact: "+91 9444055221" },
  { name: "Precision Surgical Instruments", contact: "+91 9777122110" }
];

export const INVENTORY: InventoryItem[] = Array.from({ length: 80 }, (_, i) => {
  const base = ALL[i % ALL.length];
  const hospital = HOSPITALS[i % HOSPITALS.length];
  const reorderLevel = 30 + ((i * 7) % 60);
  
  // Mix: some critically low, some expiring soon, some normal
  let quantity = 80 + ((i * 19) % 300);
  if (i % 8 === 0) quantity = Math.floor(reorderLevel * 0.5); // Low stock
  
  const expiryOffset = i % 7 === 0 ? 10 : i % 10 === 0 ? -5 : 180 + ((i * 29) % 400); // Expired or expiring soon
  const expiry = new Date(Date.now() + expiryOffset * 86400000).toISOString().slice(0, 10);
  const supplier = SUPPLIERS[i % SUPPLIERS.length];

  return {
    id: `INV-${String(i + 1).padStart(4, "0")}`,
    name: base.name,
    category: base.category,
    hospitalId: hospital.id,
    quantity,
    unit: base.unit,
    expiryDate: expiry,
    reorderLevel,
    supplierName: supplier.name,
    supplierContact: supplier.contact,
    costPerUnit: 120 + ((i * 35) % 1500),
  };
});

export function inventoryStatus(item: InventoryItem): "Expired" | "Expiring Soon" | "Low Stock" | "Normal" {
  const daysToExpiry = (new Date(item.expiryDate).getTime() - Date.now()) / 86400000;
  if (daysToExpiry < 0) return "Expired";
  if (daysToExpiry < 30) return "Expiring Soon";
  if (item.quantity < item.reorderLevel) return "Low Stock";
  return "Normal";
}

// Purchase entries history
export const PURCHASES: PurchaseEntry[] = Array.from({ length: 15 }, (_, i) => {
  const item = INVENTORY[i * 5 % INVENTORY.length];
  const quantityReceived = 50 + (i * 10);
  const cost = (item.costPerUnit || 150) * quantityReceived;
  const pDate = new Date(Date.now() - (i + 1) * 3 * 86400000).toISOString().slice(0, 10);

  return {
    id: `PUR-${String(i + 1).padStart(4, "0")}`,
    itemId: item.id,
    itemName: item.name,
    category: item.category,
    hospitalId: item.hospitalId,
    invoiceRef: `INV-2026-${String(100 + i * 17)}`,
    quantityReceived,
    cost,
    supplierName: item.supplierName || SUPPLIERS[0].name,
    purchaseDate: pDate,
  };
});

// Mutators
export function addInventoryItem(item: Omit<InventoryItem, "id">): InventoryItem {
  const newId = `INV-${String(INVENTORY.length + 1).padStart(4, "0")}`;
  const newItem = { ...item, id: newId };
  INVENTORY.push(newItem);
  return newItem;
}

export function updateInventoryItem(id: string, details: Partial<InventoryItem>): InventoryItem | null {
  const idx = INVENTORY.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  INVENTORY[idx] = { ...INVENTORY[idx], ...details };
  return INVENTORY[idx];
}

export function logInventoryUsage(id: string, quantityUsed: number): InventoryItem | null {
  const idx = INVENTORY.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  INVENTORY[idx].quantity = Math.max(0, INVENTORY[idx].quantity - quantityUsed);
  return INVENTORY[idx];
}

export function logStockAdjustment(id: string, newQty: number): InventoryItem | null {
  const idx = INVENTORY.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  INVENTORY[idx].quantity = Math.max(0, newQty);
  return INVENTORY[idx];
}

export function addPurchaseEntry(entry: Omit<PurchaseEntry, "id" | "cost" | "itemName" | "category">): PurchaseEntry | null {
  const item = INVENTORY.find((i) => i.id === entry.itemId);
  if (!item) return null;

  const newId = `PUR-${String(PURCHASES.length + 1).padStart(4, "0")}`;
  const cost = (item.costPerUnit || 150) * entry.quantityReceived;

  const newEntry: PurchaseEntry = {
    id: newId,
    itemId: entry.itemId,
    itemName: item.name,
    category: item.category,
    hospitalId: entry.hospitalId,
    invoiceRef: entry.invoiceRef,
    quantityReceived: entry.quantityReceived,
    cost,
    supplierName: entry.supplierName,
    purchaseDate: entry.purchaseDate,
  };

  PURCHASES.unshift(newEntry);

  // Auto-increase inventory stock quantity
  item.quantity += entry.quantityReceived;

  return newEntry;
}
