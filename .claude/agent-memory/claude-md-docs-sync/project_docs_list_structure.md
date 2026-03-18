---
name: CLAUDE.md documentation list structure
description: Format and current state of the documentation files list in CLAUDE.md under the "IMPORTANT: Documentation First" section
type: project
---

The documentation files list lives in CLAUDE.md under the `## IMPORTANT: Documentation First` section. Each entry uses the format `-/docs/filename.md` (dash immediately followed by the path, no space).

Current entries as of 2026-03-16:
-/docs/ui.md
-/docs/data-fetching.md
-/docs/auth.md
-/docs/data-mutations.md
-/docs/server-components.md
-/docs/routing.md

**Why:** This list tells Claude Code which docs to consult before generating any code.

**How to apply:** When a new file is added to /docs, append a new `-/docs/filename.md` line at the end of this list. Verify the file exists on disk before adding.

Note: As of 2026-03-16, `docs/ui.md` is listed in CLAUDE.md but does not appear to exist on disk — flag this if encountered during future sync tasks.
