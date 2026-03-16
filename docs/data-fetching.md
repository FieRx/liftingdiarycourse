# Data Fetching

## CRITICAL RULE: Server Components Only

**ALL data fetching in this application MUST be done exclusively via React Server Components.**

Under ABSOLUTELY no circumstances should data be fetched via:
- Route handlers (`/api/*`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side data fetching library
- Any other method

**Only server components may fetch data. No exceptions.**

## Database Queries via `/data` Helper Functions

All database queries must go through helper functions located in the `/data` directory. These functions:

- Use **Drizzle ORM** exclusively — never raw SQL
- Are called only from server components
- Enforce per-user data isolation (see below)

**Correct pattern:**

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// src/app/dashboard/page.tsx (server component)
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);
  return <WorkoutList workouts={workouts} />;
}
```

## Security: User Data Isolation

**A logged-in user must ONLY be able to access their own data.**

Every `/data` helper function that returns user-specific data MUST:

1. Accept a `userId` parameter
2. Filter all queries by that `userId` using Drizzle's `eq(table.userId, userId)`
3. Never expose data belonging to other users

The `userId` must always come from the authenticated session — never from user-supplied input (URL params, request body, etc.).

**Wrong — trusts user input:**
```ts
// NEVER DO THIS
export async function getWorkout(workoutId: string, userId: string) {
  // userId comes from a query param — attacker can pass any userId
}
```

**Correct — userId always from session:**
```tsx
// In the server component
const session = await auth();
const workout = await getWorkout(workoutId, session.user.id);
```

Failing to filter by `userId` is a critical security vulnerability. Every query that touches user data must include the `userId` filter.
