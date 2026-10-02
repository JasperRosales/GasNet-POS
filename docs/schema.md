# GasNet POS Database Reference

The POS is a Vite/React client that uses Supabase directly. Its database model is
defined by the root [`schema.sql`](../../schema.sql) and the migrations in
`supabase/migrations/`. This document describes the authoritative schema.

## Configuration

Provide only the project's public Supabase client configuration through local
environment variables or the deployment's environment settings:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Never commit service-role keys, database passwords, Auth credentials, or other
secrets. `password` on `staff` is nullable legacy data; the client authenticates
with Supabase Auth and does not read it.

## Tables

All tables are in `public`.

| Table | Columns | Keys and constraints |
| --- | --- | --- |
| `branches` | `branch_id`, `branch_name`, `location`, `contact_no` | PK `branch_id`; unique `branch_name` |
| `staff` | `staff_id`, `branch_id`, `username`, nullable `password`, `role` | PK `staff_id`; unique `username`; FK `branch_id -> branches`; role is `Admin`, `Staff`, or `Manager` |
| `products` | `product_id`, `product_name`, `weight_kg`, `active` | PK `product_id`; `weight_kg > 0` |
| `branch_stock` | `stock_id`, `branch_id`, `product_id`, `quantity`, `reorder_level` | PK `stock_id`; unique `(branch_id, product_id)`; branch/product FKs; nonnegative quantities and reorder levels |
| `branch_product_prices` | `branch_id`, `product_id`, `price`, `updated_at` | PK `(branch_id, product_id)`; branch/product FKs; `price >= 0` |
| `sales_transactions` | `sales_id`, `idempotency_key`, nullable `tracking_no`, `guest_name`, nullable `guest_phone`, nullable `delivery_address`, `transaction_date`, `branch_id`, `staff_id`, `transaction_type`, `subtotal`, `total` | PK `sales_id`; unique `(branch_id, idempotency_key)`; unique `tracking_no`; FK `branch_id -> branches`; type is `Instore`, `Commercial`, or `Delivery`; totals are nonnegative. `tracking_no` is a legacy sale-level column; the POS now records tracking numbers per product on `sales_transaction_items` |
| `sales_transaction_items` | `line_id`, `sales_id`, `product_id`, `quantity`, `unit_price_at_sale`, `tracking_no`, `created_at` | PK `line_id`; FK `sales_id -> sales_transactions`; FK `product_id -> products`; `quantity > 0`; `unit_price_at_sale >= 0`; item-level tracking number |
| `delivery` | `delivery_id`, `sales_id`, `branch_id`, `product_id`, `quantity`, `unit_price_at_sale`, `created_at` | PK `delivery_id`; FK `sales_id`, `branch_id`, `product_id`; per-item delivery record for `Delivery` sales |
| `deliveries` | `delivery_id`, `sales_id`, `status`, `updated_at` | PK `delivery_id`; FK `sales_id -> sales_transactions` with cascade delete; status is `Pending`, `Out for Delivery`, `Delivered`, or `Cancelled` |
| `purchased` | `purchased_id`, `sales_id`, `branch_id`, `product_id`, `quantity`, `unit_price_at_sale`, `purchased_at` | PK `purchased_id`; FK `sales_id`, `branch_id`, `product_id`; record of in-store purchases |
| `returned` | `returned_id`, `sales_id`, `branch_id`, `product_id`, `quantity`, `tracking_no`, `reason`, `created_at` | PK `returned_id`; FK `sales_id`, `branch_id`, `product_id`; returned items keyed by the product's tracking number |
| `v_purchased_by_branch_product` | view | Aggregates in-store purchases per branch/product: `purchased_quantity`, `purchased_value` |
| `notifications` | `notification_id`, `branch_id`, `title`, `message`, `notification_type`, `created_at`, `is_read` | PK `notification_id`; FK `branch_id -> branches` |
| `revenue_targets` | `target_id`, `branch_id`, `period_start`, `period_end`, `target_revenue`, `created_at` | PK `target_id`; unique `(branch_id, period_start, period_end)`; `target_revenue > 0`; `period_end >= period_start` |

## Stock Management

The POS automatically manages stock in `branch_stock`:

1. **Before sale:** Current stock levels are fetched and validated against requested quantities
2. **After sale:** Stock is decremented by the sold quantity for each item
3. **Idempotent retries:** Stock is NOT decremented again when a duplicate idempotency key is detected

If a product has no stock record, the sale is rejected with an error asking the user to contact their administrator.

## Authenticated Profile and Branch Scoping

Supabase Auth identifies the user UUID. The client loads the matching `staff`
row using `staff_id`, then obtains that row's real `branch_id` and role. The
browser does not supply a branch ID for product reads, price changes, or sale
creation.

The POS assumes the live database has appropriate RLS policies (the root dump
enables RLS with permissive policies only on `purchased`, `delivery`,
`returned`, and `sales_transaction_items`):

- users can read their own staff profile and required branch/product data;
- reads of branch prices, stock, and sales are limited to data allowed to the
  authenticated branch/user;
- `branch_product_prices` writes and `sales_transactions` inserts are allowed
  only when the row's branch belongs to the authenticated staff member.

These policies are deployment security configuration and must be preserved or
reviewed independently; this client does not replace them.

## Client Operations

| Operation | Tables | Behavior |
| --- | --- | --- |
| Login | Supabase Auth | Signs in with the text entered as username, which must be the account email. |
| Profile | `staff`, nested `branches` | Selects only `staff_id`, `username`, `branch_id`, `role`, and `branch_name`. |
| Product list | `branch_product_prices`, `branch_stock`, `products` | Reads prices and stock filtered to the authenticated branch, then active product metadata. |
| Price update | `branch_product_prices` | Upserts `(branch_id, product_id, price)` using the authenticated branch. Prices must be nonnegative whole numbers because the DB uses integer. |
| Transaction list | `sales_transactions`, nested `sales_transaction_items`, `products` | Selects transaction headers with line items and product details. |
| Sale | `sales_transactions`, `sales_transaction_items`, `branch_stock`, `branch_product_prices`, `purchased`, `delivery` | Validates stock, inserts transaction header, inserts line items (with per-item `tracking_no`), decrements stock, writes `purchased` (Instore) or `delivery` (Delivery) rows. See [POS Service Layer](pos-service.md#create-sale) for details. |
| Return | `sales_transaction_items`, `returned`, `branch_stock` | Finds the sale line by the product's tracking number, caps the returnable quantity, inserts into `returned`, and restores stock. |

## Retry and Idempotency

The UI retains one generated key per unchanged checkout and reuses it after a
failed request. The client first inserts the sale; a duplicate
`(branch_id, idempotency_key)` is treated as a retry and loads the existing row.
Stock is only decremented on the first successful insert. The cart is cleared
only after success. The cart is not cleared if the insert response is lost and
a subsequent read is also unable to establish the result; the same key can
safely be retried.

The client also checks its own key length and the schema's 80-character limit.
Deployment-side concurrency handling or additional RPCs may be added, but they
require a separately reviewed migration and are not assumed by this client.
