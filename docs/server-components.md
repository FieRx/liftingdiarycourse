# Server Components

## CRITICAL RULE: Async Props Are Promises — Always Await Them

**This project uses Next.js 15, where `params` and `searchParams` are Promises. They MUST be awaited before use. Accessing them synchronously will not work.**

Never destructure or access `params` or `searchParams` directly — always `await` them first.

**Wrong — synchronous access:**
```tsx
// NEVER DO THIS
export default async function EditWorkoutPage({ params }: { params: { workoutId: string } }) {
  const id = Number(params.workoutId); // ❌ — params is a Promise in Next.js 15
}
```

**Correct — awaited params:**
```tsx
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params; // ✅
  const id = Number(workoutId);
}
```

**Correct — awaited searchParams:**
```tsx
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams; // ✅
}
```

---

## Type Signatures for Pages with Dynamic Segments

Always type `params` and `searchParams` as `Promise<...>` in the component signature. Never use the old synchronous object type.

| Prop           | Type                                     |
| -------------- | ---------------------------------------- |
| `params`       | `Promise<{ [segment]: string }>`         |
| `searchParams` | `Promise<{ [key]: string \| string[] \| undefined }>` |

---

## General Server Component Rules

- All server components must be `async` functions — data fetching and prop access both require `await`
- Never pass `params` or `searchParams` down to child components un-awaited; resolve them in the page and pass plain values
- Validate dynamic segment values before use — e.g. check `isNaN(id)` and call `notFound()` if invalid
- Call `notFound()` from `next/navigation` when a resource does not exist or does not belong to the current user

**Correct — full pattern for a dynamic route page:**
```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const id = Number(workoutId);
  if (isNaN(id)) notFound();

  const workout = await getWorkoutById(id, userId);
  if (!workout) notFound();

  return <WorkoutDetail workout={workout} />;
}
```
