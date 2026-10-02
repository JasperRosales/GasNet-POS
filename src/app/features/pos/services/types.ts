export interface StaffProfile {
  staffId: string;
  username: string;
  branchId: number;
  role: string;
  branchName: string;
}

export interface SaleRequest {
  idempotencyKey: string;
  customer: string;
  transactionType: "Instore" | "Commercial" | "Delivery";
  items: Array<{ productId: number; quantity: number; unitPrice?: number; trackingNo?: string }>;
  guestPhone?: string;
}
