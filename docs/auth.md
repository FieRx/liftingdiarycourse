# Authentication

## CRITICAL RULE: Clerk Only

**This application uses Clerk for ALL authentication. No other auth library, custom session handling, or JWT management should ever be introduced.**

Never use:
- NextAuth / Auth.js
- Custom JWT signing or session cookies
- `bcrypt` / manual password handling
- Any other third-party auth library

**Clerk is the single source of truth for identity. No exceptions.**

## Getting the Current User

Always retrieve the authenticated user via Clerk's server-side helpers. Never trust client-supplied user IDs.

**In Server Components and data helpers:**

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

**Protecting a page — redirect unauthenticated users:**

```tsx
// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // safe to fetch user data here
}
```

## Route Protection

Use Clerk's `clerkMiddleware` in `src/middleware.ts` to protect routes at the edge. Define public routes explicitly; all other routes are protected by default.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

## User ID in Data Helpers

The `userId` passed to any `/data` helper function **must always come from `auth()`** — never from URL params, query strings, or request bodies. See `data-fetching.md` for the full data isolation rules.

```ts
// Correct
const { userId } = await auth();
const workouts = await getWorkoutsForUser(userId);

// NEVER DO THIS — userId from user-controlled input
const workouts = await getWorkoutsForUser(searchParams.userId);
```

## UI Components

Use Clerk's pre-built components for sign-in/sign-up flows and the user button. Do not build custom auth forms.

```tsx
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
```
