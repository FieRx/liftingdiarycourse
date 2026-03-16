# Data Mutations

## CRITICAL RULES: Server Actions + Data Helpers

**ALL data mutations in this application MUST follow these rules without exception:**

1. Mutations are performed via **helper functions in `src/data/`** that wrap Drizzle ORM calls
2. Those helpers are called from **server actions only**
3. Server actions live in **colocated `actions.ts` files** next to the route they serve
4. Server action parameters must be **typed TypeScript arguments** — never `FormData`
5. Server actions MUST **validate all arguments with Zod** before touching the database

---

## Database Mutations via `/data` Helper Functions

All database writes (insert, update, delete) must go through helper functions in the `/data` directory. These functions:

- Use **Drizzle ORM** exclusively — never raw SQL
- Are called only from server actions
- Enforce per-user data isolation (see Security section below)

**Correct pattern:**

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}

export async function deleteWorkout(workoutId: string, userId: string) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId), eq(workouts.userId, userId));
}
```

---

## Server Actions

All mutations must be triggered through server actions. Server actions must:

- Be defined in a **colocated `actions.ts` file** next to the page or component that uses them
- Use the `"use server"` directive
- Accept **typed parameters** — never `FormData`
- **Validate all arguments with Zod** before calling any `/data` helper

**Correct pattern:**

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  date: Date;
}) {
  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const session = await auth();
  return createWorkout(session.user.id, parsed.data.name, parsed.data.date);
}
```

```tsx
// src/app/workouts/NewWorkoutForm.tsx (client component)
"use client";

import { createWorkoutAction } from "./actions";

export function NewWorkoutForm() {
  async function handleSubmit() {
    await createWorkoutAction({ name: "Push Day", date: new Date() });
  }

  return <button onClick={handleSubmit}>Add Workout</button>;
}
```

---

## Redirects After Mutations

**Never call `redirect()` inside a server action.** Redirects must be handled client-side after the server action resolves.

**Wrong — redirect inside server action:**
```ts
// NEVER DO THIS
"use server";
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: { name: string; date: string }) {
  // ...mutation logic...
  redirect("/dashboard"); // ❌ — do not redirect from a server action
}
```

**Correct — redirect client-side after the action resolves:**
```tsx
// src/app/workouts/new/NewWorkoutForm.tsx (client component)
"use client";
import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";

export function NewWorkoutForm() {
  const router = useRouter();

  async function handleSubmit() {
    await createWorkoutAction({ name: "Push Day", date: "2026-03-16" });
    router.push("/dashboard"); // ✅ — redirect after action resolves
  }
  // ...
}
```

---

## What NOT to Do

**Wrong — raw db call inside a server action:**
```ts
// NEVER DO THIS — bypass the /data layer
"use server";
import { db } from "@/db";
export async function createWorkoutAction() {
  await db.insert(workouts).values({ ... }); // ❌
}
```

**Wrong — FormData params:**
```ts
// NEVER DO THIS
export async function createWorkoutAction(formData: FormData) { // ❌
```

**Wrong — no Zod validation:**
```ts
// NEVER DO THIS
export async function createWorkoutAction(params: { name: string }) {
  await createWorkout(params.name); // ❌ — unvalidated input
}
```

**Wrong — action not colocated:**
```
src/actions/workouts.ts  // ❌ — actions must live next to the route
```

---

## Security: User Data Isolation

The same rules from `data-fetching.md` apply to mutations:

- Every `/data` mutation helper must accept a `userId` parameter and scope the write to that user
- `userId` must always come from the authenticated session — never from user-supplied input
- A user must never be able to mutate another user's data

**Correct — userId from session, not from params:**
```ts
// src/app/workouts/actions.ts
export async function deleteWorkoutAction(params: { workoutId: string }) {
  const parsed = z.object({ workoutId: z.string().uuid() }).safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const session = await auth();
  // userId comes from session — attacker cannot target another user's workout
  await deleteWorkout(parsed.data.workoutId, session.user.id);
}
```

**Wrong — trusts client-supplied userId:**
```ts
// NEVER DO THIS
export async function deleteWorkoutAction(params: {
  workoutId: string;
  userId: string; // ❌ — attacker controls this
}) {
  await deleteWorkout(params.workoutId, params.userId);
}
```
