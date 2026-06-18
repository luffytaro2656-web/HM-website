export type InventoryCategory = "Medicine" | "Surgical" | "Consumable" | "Equipment";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  hospitalId: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  reorderLevel: number;
  supplierName?: string;
  supplierContact?: string;
  costPerUnit?: number;
}

export interface PurchaseEntry {
  id: string;
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  hospitalId: string;
  invoiceRef: string;
  quantityReceived: number;
  cost: number;
  supplierName: string;
  purchaseDate: string;
}
