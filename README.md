# GasNet-POS Documentation

Point-of-Sale system for CJG TRADING LPG cylinder distribution. React + TypeScript + Vite + Supabase.

> **Note:** The app will not work unless the environment API keys are set. Create a local env file with:
>
> ```env
> VITE_SUPABASE_URL=https://<project>.supabase.co
> VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
> ```

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System overview, data flow, design patterns, tech stack |
| [Database Schema](schema.md) | Table definitions, constraints, client operations, RLS notes |
| [Supabase Services](services-supabase.md) | Client singleton, error normalization, idempotency keys |
| [POS Service Layer](pos-service.md) | Core business logic — auth, products, stock, sales, transactions |
| [Custom Hooks](hooks.md) | `useCart`, `useBranchProducts`, `useStaffSession`, `useTransactions` |
| [Components](components.md) | UI components — ProductGrid, CartPanel, ReceiptModal, etc. |
| [Pages](pages.md) | Route-level pages — StaffLoginPage, StaffPOSPage |
| [Types](types.md) | Domain type definitions |
| [Styles](styles.md) | Design system, theme tokens, Tailwind config |

## Quick Reference

| Topic | Document |
|-------|----------|
| How stock reduction works | [POS Service Layer](pos-service.md#stock-management) |
| How checkout/idempotency works | [POS Service Layer](pos-service.md#create-sale) |
| How auth/route protection works | [Pages](pages.md#route-protection) |
| How products are loaded | [POS Service Layer](pos-service.md#fetch-branch-products) |
| How the cart enforces stock limits | [Custom Hooks](hooks.md#usecart) |
