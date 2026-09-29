import type { Product, Transaction } from "../types";
import type { SaleRequest, StaffProfile } from "./types";

export interface IStaffAuth {
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  getProfile(): Promise<{ data: StaffProfile | null; error: Error | null }>;
  getCurrentStaff(): Promise<StaffProfile>;
}

export interface IProductCatalog {
  getBranchProducts(): Promise<{ data: Product[]; error: Error | null }>;
  updatePrice(productId: number, price: number): Promise<{ error: Error | null }>;
  getBranchPrices(productIds: number[]): Promise<Map<number, number>>;
  getProductDetails(productIds: number[]): Promise<Map<number, { name: string; weightKg: number }>>;
}

export interface IStockService {
  getBranchStock(): Promise<{ data: Map<number, number>; error: Error | null }>;
  getStockForProducts(productIds: number[]): Promise<Map<number, number>>;
  validateAndDecrement(items: Array<{ productId: number; quantity: number }>): Promise<void>;
}

export interface ITransactionHistory {
  getTransactions(): Promise<{ data: Transaction[]; error: Error | null }>;
}

export interface ISaleProcessor {
  createSale(input: SaleRequest): Promise<Transaction>;
}
