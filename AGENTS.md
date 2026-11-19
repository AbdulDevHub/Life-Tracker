# AGENTS.md

Context for AI coding agents working on this repo. Read it first; it lists the commands, rules and boundaries that aren't obvious from the code.
After any meaningful change to this project, update this file, `context/PROGRESS_TRACKER.md`, and the "Project Overview" section of `README.md` to reflect the current state — do this proactively, without being asked.

## Overview
Life Tracker is a Manifest V3 Chrome extension (popup + optional full tab) with three tabs: Habits, Water, Exercise. Formerly Hydration Hero; v2 merged in a rebuilt habit tracker and added exercise tracking.

## Tech stack
React 18, Vite 5, Tailwind CSS 3 (CSS-variable colours), React Icons (`react-icons/lu`), canvas-confetti, `@fontsource-variable/manrope`, Vitest. pnpm.

## Commands
- Install: `pnpm install` (esbuild build script is allowed in `pnpm-workspace.yaml`)
- Dev: `pnpm dev` → http://localhost:5173/?demo=1&tab=habits|water|exercise (&theme=light, &view=tab)
- Test: `pnpm test` · Lint: `pnpm lint` · Build: `pnpm build` → `build/` (load unpacked)

Verify: pnpm lint && pnpm test
Verify-full: pnpm build

## Conventions
- All data lives in `chrome.storage.local` under `lt.habits`, `lt.water`, `lt.exercise`, `lt.settings`; read/write only through `useStored()` (`src/lib/useStore.js`). Outside the extension it falls back to localStorage.
- Keep pure logic (dates, streaks, import) out of components so Vitest can cover it; React components stay in `features/<tab>/`.
- Changing a storage shape: bump `SCHEMA_VERSION` in `src/lib/defaults.js` and keep `parseImport` able to read older backups.
- `public/background.js` is plain JS copied as-is (not bundled). It duplicates `habitsForMonth`/`waterDayKey` logic; keep both in sync.
- Colours come from CSS variables in `src/index.css`; per-tab accent via `--accent` (see `context/UI_TOKENS.md`).
- Popup is 800 px wide (Chrome max) and its height follows content up to 600 px; Water and Exercise use a fixed 424 px three-column body. Check every UI change at that size.

## Boundaries
- No host permissions or content scripts without asking: the extension must not read pages.

## More
`README.md` (plain-language overview, install), `context/` (progress, architecture, UI tokens).
