# Routing

## Route Structure

All application routes live under `/dashboard`. The root `/` route is a public landing/marketing page only.

```
/                          → public (unauthenticated)
/dashboard                 → protected (requires login)
/dashboard/workout/new     → protected
/dashboard/workout/[id]    → protected
```

## Route Protection via Middleware

**ALL `/dashboard` routes MUST be protected via Next.js middleware.** Do not rely on per-page auth checks as the primary protection mechanism.

Route protection is handled in `src/middleware.ts` using the auth library's middleware helper:

```ts
// src/middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Rules

- **Never** add a `/dashboard` route that is publicly accessible.
- **Never** gate access to a dashboard route using only in-component session checks — middleware is the enforcer.
- In-component `auth()` calls are still required for reading the session (e.g. to get `userId`), but they are **not** a substitute for middleware-level route protection.
- Unauthenticated users must always be redirected to `/` (the public home page).
