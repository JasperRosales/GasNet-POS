# Pages

Route-level pages in `src/app/pages/`.

---

## StaffLoginPage

**Route:** `/` (public)

Login page for staff members. Provides a username/password form with show/hide password toggle, validation, error display, and navigation to `/staff-pos` on success.

### Flow

1. Staff enters credentials
2. Calls `loginStaff(username, password)` from the service layer
3. On success: navigates to `/staff-pos`
4. On failure: displays normalized error message

### Error Handling

Uses `normalizeSupabaseError()` to convert Supabase auth errors into user-friendly messages.

---

## StaffPOSPage

**Route:** `/staff-pos` (protected)

The main POS dashboard page. Orchestrates the entire POS workflow.

### State Management

| State | Type | Description |
|-------|------|-------------|
| `activeTab` | `ActiveTab` | Current tab: `"pos"`, `"transactions"`, or `"pricing"` |
| `customerName` | `string` | Customer name input |
| `transactionType` | `"Instore" \| "Commercial" \| "Delivery"` | Sale type |
| `receiptData` | `Transaction \| null` | Receipt to display |
| `checkoutPending` | `boolean` | Checkout in progress |
| `checkoutError` | `string` | Checkout error message |
| `idempotencyRef` | `{ fingerprint, key }` | Idempotency key cache |

### Checkout Flow

```
1. Validate cart is not empty
2. Validate customer name is entered
3. Generate idempotency key (if cart changed)
4. Call createSale() with cart items
5. On success:
   ├── Add transaction to list (optimistic)
   ├── Show receipt modal
   ├── Clear cart
   └── Reset customer name
6. On failure:
   └── Display error message
```

### Tab Content

| Tab | Content |
|-----|---------|
| `pos` | TransactionDetails + ProductGrid + CartPanel |
| `transactions` | TransactionList |
| `pricing` | PriceEditor |

---

## Route Protection

### `ProtectedRoute`

**File:** `src/app/components/ProtectedRoute.tsx`

A route guard that checks for an active Supabase session and verifies the staff profile's role.

**Props:** `{ children: ReactNode; requiredUserType: "admin" | "staff" }`

**Behavior:**
1. Shows loading state while checking session
2. Redirects to `/` if no session
3. Redirects to `/` if user role doesn't match `requiredUserType`
4. Renders children if authorized
