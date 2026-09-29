# Supabase Services

Three utility modules in `src/app/services/supabase/` provide the foundation for all backend communication.

## Client (`client.ts`)

Creates and exports the singleton Supabase client used throughout the application.

```typescript
import { supabase } from "../../../services/supabase/client";
```

### Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anonymous/publishable key |

The client is created at module load time. If either env var is missing or malformed, the module throws immediately, preventing the app from running with invalid config.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `supabase` | `SupabaseClient` | Singleton client instance |
| `createSupabaseClient()` | `() => SupabaseClient` | Factory function |
| `SupabaseConfig` | `type` | `{ url: string; publishableKey: string }` |

---

## Error Normalization (`errors.ts`)

Converts unknown error values into a consistent shape for uniform handling across the app.

### `SupabaseServiceError`

```typescript
class SupabaseServiceError extends Error {
  code?: string;
  status?: number;
}
```

### `normalizeSupabaseError(value, fallback?)`

Converts any thrown value into a `SupabaseServiceError`. If the value is already an `Error`, its message is preserved. Otherwise, a fallback message is used (default: `"An unexpected error occurred."`).

### `isSupabaseAuthError(value)`

Returns `true` if the error is auth-related (code `PGRST301`, `42501`, or HTTP status `401`). Used by `useStaffSession` to distinguish auth failures from other errors.

---

## Idempotency Keys (`idempotency.ts`)

Generates UUID-based idempotency keys for safe retry of sale submissions.

### `createIdempotencyKey()`

Returns a UUID v4 string. Falls back to a timestamp+random string if `crypto.randomUUID` is unavailable.

Used by `StaffPOSPage` during checkout to generate a key that is reused if the same cart is submitted again (e.g., network retry).
