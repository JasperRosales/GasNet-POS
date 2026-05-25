export interface Product {
  id: number;
  name: string;
  price: number;
  weight: string;
}

export type ActiveTab = "pos" | "transactions" | "pricing";

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  transactionId: string;
  date: string;
  staff: string;
  customer: string;
  type: "Instore" | "Commercial";
  items: CartItem[];
  total: number;
}
