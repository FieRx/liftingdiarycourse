# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**Before generating any code, Claude Code MUST first consult the relevant documentation files in the `/docs` directory.** Always read and follow the guidelines, conventions, and examples found there before writing or modifying any code:

-/docs/ui.md
-/docs/data-fetching.md

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**, **TypeScript**, **Tailwind CSS v4** (via PostCSS)

## Architecture

App Router layout under `src/app/`:
- `layout.tsx` — root layout with fonts and global styles
- `page.tsx` — home route (`/`)
- `globals.css` — Tailwind imports and global styles
