# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do NOT create custom components. If a UI element is needed, find the appropriate shadcn/ui component.
- Do NOT use raw HTML elements for UI (e.g., `<button>`, `<input>`, `<select>`) — always use the shadcn/ui equivalent.
- Do NOT install or use any other component library (e.g., Material UI, Chakra, Radix primitives directly, etc.).
- If a shadcn/ui component does not yet exist in the project, add it via the CLI: `npx shadcn@latest add <component>`.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be formatted using ordinal day, abbreviated month, and full year:

| Example output  |
|-----------------|
| 1st Sep 2025    |
| 2nd Aug 2025    |
| 3rd Jan 2026    |
| 4th Jun 2024    |

Use the format string `do MMM yyyy` with `format` from date-fns:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```
