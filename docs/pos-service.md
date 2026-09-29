# POS Service Layer

The core business logic module at `src/app/features/pos/services/posService.ts`. Contains all Supabase queries and data adaptation for the POS system.

## Exported Interfaces

### `StaffProfile`

```typescript
interface StaffProfile {
  staffId: string;      // Auth UUID
  username: string;
  branchId: number;
  role: string;         // "Admin" | "Staff" | "Manager"
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

---

## Authentication Functions

### `loginStaff(username, password)`

Signs in via Supabase Auth. Despite the "username" label, the auth system uses email-based credentials.

### `logoutStaff()`

Signs out the current user.

### `fetchStaffProfile()`

Returns `{ data: StaffProfile | null, error: Error | null }`. Fetches the authenticated user's profile with branch info from the `staff` table (joined with `branches`).

---

## Product & Stock Functions

### `fetchBranchProducts()`

Returns `{ data: Product[], error: Error | null }`.

Fetches all active products for the staff's branch with:
- Branch-specific pricing from `branch_product_prices`
- Current stock levels from `branch_stock`

Each product includes a `stockQuantity` field (defaults to `0` if no stock record exists).

**Database tables queried:** `branch_product_prices`, `branch_stock`, `products`

### `fetchBranchStock()`

Returns `{ data: Map<number, number>, error: Error | null }`.

Fetches stock levels for the staff's branch as a `Map<productId, quantity>`.

**Database tables queried:** `branch_stock`

### `updateBranchProductPrice(productId, price)`

Upserts a price for a branch-product pair. Validates that price is a non-negative integer.

**Database tables queried:** `branch_product_prices`

---

## Transaction Functions

### `fetchTransactions()`

Returns `{ data: Transaction[], error: Error | null }`.

Fetches all transactions with their line items, ordered by date descending.

**Database tables queried:** `sales_transactions`, `sales_transaction_items`, `products`

---

## Stock Management

Stock is managed automatically as part of the sale lifecycle:

1. **Before sale:** `createSale()` fetches current stock from `branch_stock` and validates that each item's requested quantity does not exceed available stock
2. **After sale:** Stock is decremented by the sold quantity for each item
3. **Idempotent retries:** Stock is NOT decremented again when a duplicate idempotency key is detected

If a product has no stock record, the sale is rejected with an error asking the user to contact their administrator.

---

## `createSale(input)`

The most complex function. Creates a complete sale transaction with idempotency and stock management.

### Parameters

`SaleRequest` — see interface above.

### Returns

`Transaction` — the created (or existing, on idempotent retry) transaction.

### Process

```
1. Validate idempotency key and items (positive integer quantities)
2. Authenticate staff → get branch ID
3. Fetch prices from branch_product_prices for requested products
4. Validate all products have prices for this branch
5. Calculate subtotal
6. Fetch current stock levels from branch_stock
7. Validate stock availability for each item
8. INSERT into sales_transactions
   ├── If duplicate key (23505): fetch and return existing transaction
   │   (NO stock decrement — idempotent retry)
   └── Otherwise: continue
9. INSERT line items into sales_transaction_items
10. Decrement stock in branch_stock for each item
11. Fetch product names for receipt
12. Return Transaction
```

### Error Handling

| Condition | Behavior |
|-----------|----------|
| Missing/invalid idempotency key | Throws `"A valid idempotency key is required."` |
| Invalid items (non-positive qty) | Throws `"Sale items must have positive whole-number quantities."` |
| Product has no price for branch | Throws `"One or more products do not have a price for your branch."` |
| Product has no stock record | Throws `"No stock record found..."` |
| Insufficient stock | Throws `"Insufficient stock. Available: X, Requested: Y."` |
| Stock decrement fails after sale | Logs warning (sale remains durable) |

### Database Tables Written

| Table | Operation |
|-------|-----------|
| `sales_transactions` | INSERT |
| `sales_transaction_items` | INSERT (batch) |
| `branch_stock` | UPDATE (decrement quantity) |

---

## Data Adaptation Functions

### `adaptProducts(value)`

Transforms raw Supabase rows into `Product[]`. Extracts price from the nested `branch_product_prices` relation.

### `adaptTransactions(value)`

Transforms raw Supabase rows into `Transaction[]`. Maps line items with product names and weights.

### `adaptTransaction(value, index?, submittedItems?)`

Maps a single DB row to a `Transaction`. Used both for fetched transactions and newly created sales (where in-memory cart data provides the receipt items).

---

## Internal Helpers

### `authenticatedStaff()`

Gets the current Auth user, fetches their `staff` profile with branch info, and returns a `StaffProfile`. Throws if the profile is incomplete.

### `adaptProduct(row, price)`

Maps a single product DB row to a `Product` object.

---

## Barrel Exports

All service functions are re-exported from `src/app/features/pos/index.ts`:

```typescript
export {
  createSale,
  fetchBranchProducts,
  fetchBranchStock,
  fetchStaffProfile,
  fetchTransactions,
  loginStaff,
  logoutStaff,
  updateBranchProductPrice,
} from "./services/posService";
```
