# Architecture

## Overview

GasNet-POS is a single-page application (SPA) that serves as the staff-facing point-of-sale terminal for CJG TRADING. It communicates exclusively with a Supabase backend for authentication, data storage, and real-time queries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ with TypeScript |
| Build tool | Vite |
| Routing | React Router v7 |
| Backend/Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI (shadcn/ui pattern) |
| Icons | Lucide React |
| Package manager | npm |

## Application Shell

```
main.tsx
  └── App.tsx
        └── RouterProvider (routes.tsx)
              ├── /              → StaffLoginPage (public)
              └── /staff-pos     → ProtectedRoute → StaffPOSPage
```

## Data Flow

```
StaffLoginPage
  │
  ▼
loginStaff() ──→ Supabase Auth (email + password)
  │
  ▼
StaffPOSPage (ProtectedRoute)
  │
  ├── useStaffSession ──→ supabase.auth + fetchStaffProfile()
  │
  ├── useBranchProducts ──→ fetchBranchProducts()
  │                          ├── branch_product_prices
  │                          ├── branch_stock
  │                          └── products
  │
  ├── useCart ──→ (local state, enforces stock limits)
  │
  ├── useTransactions ──→ fetchTransactions()
  │                          ├── sales_transactions
  │                          └── sales_transaction_items
  │
  └── createSale() ──→ INSERT sales_transactions
                     ──→ INSERT sales_transaction_items
                     ──→ UPDATE branch_stock (decrement)
```

## Design Patterns

### Server-Side Price Authority
Prices are always fetched from `branch_product_prices` at query time. The client never stores or sends prices — they are read from the database on every product load and sale creation.

### Idempotent Checkout
Each sale submission carries a UUID-based idempotency key. A unique constraint on `(branch_id, idempotency_key)` in `sales_transactions` ensures that retried submissions return the original sale instead of creating a duplicate. Stock is only decremented on the first successful insert.

### Stock Validation & Decrement
1. Before creating a sale, current stock levels are fetched from `branch_stock`
2. Each item's requested quantity is validated against available stock
3. After the sale is durably recorded, stock is decremented per item
4. Idempotent retries do NOT decrement stock again

### Auth-Based Data Scoping
All queries are scoped to the authenticated staff member's `branch_id`. The server rejects any attempt to read or write data for a different branch.

### Error Normalization
All Supabase errors pass through `normalizeSupabaseError()` which converts them into a consistent `SupabaseServiceError` shape with `message`, `code`, and optional `status` fields.

### Optimistic UI
New transactions are immediately prepended to the transaction list via `addTransaction()` without waiting for a refetch.

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `staff` | Staff profiles with branch and role |
| `branches` | Branch names |
| `products` | Product catalog (name, weight, active) |
| `branch_product_prices` | Per-branch pricing |
| `branch_stock` | Per-branch stock levels |
| `sales_transactions` | Transaction headers |
| `sales_transaction_items` | Transaction line items |
