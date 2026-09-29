# Types

Domain type definitions in `src/app/features/pos/types.ts`.

---

## `Product`

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  weight: string;          // e.g., "11kg"
  stockQuantity?: number;  // current stock at the branch
}
```

---

## `ActiveTab`

```typescript
type ActiveTab = "pos" | "transactions" | "pricing";
```

---

## `CartItem`

```typescript
interface CartItem extends Product {
  quantity: number;
}
```

Extends `Product` with a `quantity` field for cart management.

---

## `Transaction`

```typescript
interface Transaction {
  transactionId: string;
  date: string;
  staff: string;
  customer: string;
  type: "Instore" | "Commercial" | "Delivery";
  items: CartItem[];
  total: number;
}
```

---

## Service-Layer Types

These are defined in `posService.ts` and not exported from the barrel file:

### `StaffProfile`

```typescript
interface StaffProfile {
  staffId: string;
  username: string;
  branchId: number;
  role: string;
  branchName: string;
}
```

### `SaleRequest`

```typescript
interface SaleRequest {
  idempotencyKey: string;
  customer: string;
  transactionType: "Instore" | "Commercial" | "Delivery";
  items: Array<{ productId: number; quantity: number }>;
}
```
