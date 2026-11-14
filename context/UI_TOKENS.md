# UI Tokens and Rules

The design variables and layout rules that keep the three tabs looking like one product.
Use these tokens instead of raw hex values in components. Update this file when a token or shared component changes.

## Colours (`src/index.css`, RGB triplets, used as Tailwind `bg-base`, `text-muted`, `bg-accent/15` …)
| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--bg` | 17 17 20 | 244 244 246 | page |
| `--surface` | 27 27 32 | 255 255 255 | cards |
| `--raised` | 38 38 45 | 236 236 241 | inputs, chips, empty cells |
| `--line` | 52 52 61 | 222 222 229 | borders, unworked muscles |
| `--ink` / `--muted` | text / secondary text | | |
| `--habit` | #9d78fa violet | | Habits accent |
| `--water` | #1cabe3 cyan | | Water accent (from Hydration Hero) |
| `--lift` | #f98028 orange | | Exercise accent, streak flames |

`--accent` is set per tab on the app root, so `bg-accent`, `text-accent` and focus rings follow the active tab.

## Type and shape
- Font: Manrope Variable (bundled). Headings `font-extrabold`, labels use the `.label` class (11px uppercase muted).
- Cards: `Card` (rounded-2xl, border-line, bg-surface, p-4). Buttons: pill `Button` variants primary/soft/ghost/danger. Inputs: `.field`.
- Logo: `public/icons/logo.svg`; three stroke segments in the tab colours. Regenerate PNGs (16/32/48/128) from it with sharp.

## Rules
- Popup 800 px wide, height follows content (max 600). Habits = stats card + month grid (habit names column + one column per day). Water and Exercise = three columns at 468 px tall. No page scroll.
- Each tab = summary card on top, input card, then list/history card.
- Hover-only actions (delete, re-log) must also show on keyboard focus.
- Respect `prefers-reduced-motion` (global rule in `index.css`; confetti uses `disableForReducedMotion`).
