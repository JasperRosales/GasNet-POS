# Custom Hooks

Four custom hooks in `src/app/features/pos/hooks/` manage the POS application state.

---

## `useCart()`

Manages the shopping cart state with stock-aware quantity controls.

**File:** `src/app/features/pos/hooks/useCart.ts`

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `cart` | `CartItem[]` | Current cart items |
| `addToCart` | `(product: Product) => void` | Add item (respects stock limit) |
| `updateQuantity` | `(id: number, delta: number) => void` | Increment/decrement (respects stock limit) |
| `removeFromCart` | `(id: number) => void` | Remove item entirely |
| `clearCart` | `() => void` | Empty the cart |
| `total` | `number` | Computed cart total |
| `itemCount` | `number` | Total item quantity |

### Stock Enforcement

- `addToCart` will not add an item if the cart already contains the available stock quantity for that product
- `updateQuantity` will not increment beyond the available stock quantity
- Stock limits come from `product.stockQuantity` (loaded by `useBranchProducts`)

---

## `useBranchProducts(branchId)`

Fetches branch-specific products with loading/error states and a reload mechanism.

**File:** `src/app/features/pos/hooks/useBranchProducts.ts`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `branchId` | `number \| null` | The staff member's branch ID |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `products` | `Product[]` | Products with prices and stock |
| `loading` | `boolean` | Fetch in progress |
| `error` | `string` | Error message (empty if none) |
| `reload` | `() => void` | Trigger a refetch |

### Behavior

- Fetches when `branchId` changes or `reload()` is called
- Returns empty array if `branchId` is `null`
- Uses `fetchBranchProducts()` from the service layer

---

## `useStaffSession()`

Manages the staff authentication session and profile.

**File:** `src/app/features/pos/hooks/useStaffSession.ts`

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `staffName` | `string` | Logged-in staff username |
| `branchId` | `number \| null` | Staff's branch ID |
| `status` | `"loading" \| "unauthorized" \| "ready" \| "error"` | Session state |
| `error` | `string` | Error message |

### Behavior

- On mount: checks for an active Supabase session
- If session exists: fetches staff profile via `fetchStaffProfile()`
- Listens for auth state changes (sign in/out)
- Sets `status` to `"unauthorized"` if no session or auth error
- Sets `status` to `"ready"` when profile is loaded

---

## `useTransactions()`

Fetches transaction history with optimistic updates.

**File:** `src/app/features/pos/hooks/useTransactions.ts`

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `transactions` | `Transaction[]` | Transaction history |
| `loading` | `boolean` | Fetch in progress |
| `error` | `string` | Error message |
| `addTransaction` | `(txn: Transaction) => void` | Prepend a transaction (optimistic) |
| `reload` | `() => void` | Refetch from server |

### Behavior

- Fetches on mount via `fetchTransactions()`
- `addTransaction` prepends to the local array without refetching (used after checkout)
- `reload` re-fetches the full list from the server
