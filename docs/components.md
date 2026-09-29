# Components

UI components in `src/app/features/pos/components/`.

---

## `POSHeader`

Displays the POS header with store name, staff name, and logout button.

**Props:** `{ staffName: string; onLogout: () => void }`

---

## `POSTabs`

Tab navigation bar with three tabs: POS, Transaction List, and Pricing.

**Props:** `{ activeTab: ActiveTab; onChange: (tab: ActiveTab) => void }`

---

## `TransactionDetails`

Form section for entering customer name and selecting transaction type.

**Props:**
```typescript
{
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  transactionType: "Instore" | "Commercial" | "Delivery";
  onTransactionTypeChange: (type: "Instore" | "Commercial" | "Delivery") => void;
}
```

---

## `ProductGrid`

Displays a grid of LPG cylinder products with weight, price, and stock info.

**Props:**
```typescript
{
  products: Product[];
  loading: boolean;
  error: string;
  onAddToCart: (product: Product) => void;
}
```

### Stock Display

- Shows stock count on each product card
- Disables the button when stock is 0
- Shows "Out of Stock" badge on unavailable items
- Grays out the card with reduced opacity

---

## `CartPanel`

Displays the shopping cart with line items, quantity controls, and checkout button.

**Props:**
```typescript
{
  cart: CartItem[];
  itemCount: number;
  total: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  onCheckout: () => void | Promise<void>;
  checkoutPending?: boolean;
  checkoutError?: string;
}
```

---

## `TransactionList`

Displays transaction history in a table format.

**Props:**
```typescript
{
  transactions: Transaction[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}
```

---

## `ReceiptModal`

Modal dialog displaying an official receipt after a successful transaction.

**Props:** `{ receiptData: Transaction | null; onClose: () => void }`

---

## `PriceEditor`

Interface for editing branch-specific product prices.

**Props:**
```typescript
{
  products: Product[];
  loading: boolean;
  error: string;
  onSavePrice: (productId: number, price: number) => Promise<string | null>;
}
```

Shows products with input fields and save buttons. Displays per-product success/error feedback.
