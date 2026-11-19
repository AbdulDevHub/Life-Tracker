# Progress Tracker

Running log of where Life Tracker stands, so a new session can pick up where the last one stopped.
Update "Current state", "In progress" and "Next steps" after meaningful work, and add a dated entry to the session log (newest first). Fold stale entries into "Earlier history".

## Current state
- v2.0.0 builds and passes lint + unit tests. The user's habit history has been imported and checked.
- Landscape popup (800 px wide, height follows content).
- Habits: month grid (habits × days), month/week/today rings, active-streaks panel, streak badges (7/21/30/66/100, earned from best streak, shown in the editor and on Active Streaks rows), editor (rename, colour, reorder, remove from month onward).
- Water: progress tank, glass presets + custom, today log with delete, 7-day chart, 3 AM rollover, goal editing.
- Exercise: front/back SVG muscle map (today / 7 days), log form with a 60+ exercise catalogue, history grouped by day with filter and re-log, Favourites / History / Stats toggle (week/month/year totals, sets chart, top exercises; logic in `features/exercise/stats.js`), reset today, favourite exercises (one-click log using the latest values).
- Settings: theme, toolbar badge, habit/water reminders, kg/lb, JSON backup export/import (merge or replace), reset.
- Service worker: badge = habits left today; alarms for reminders.

## In progress
- Nothing open.

## Next steps
- User: upload `docs/social-preview.png` in GitHub Settings → General → Social preview (no API for it).
- Optional: publish to the Chrome Web Store, then add the store link as the repo homepage.
- Ideas the user may pick: sleep tab, mood/journal tab, focus timer, weekly review; exercise personal records, rest timer, workout templates.

## Session log
### 2026-11-19
- Exercise: body map enlarged (viewBox cropped to the figure, fills the left card), Favourites/History switch centred, "Reset today" button (click twice) clears today's entries.
- Removed the header light/dark toggle; theme lives only in Settings.
- Habit grid row gap tightened (6 px → 4 px).
- Toolbar badge now cyan with dark text (was purple). Water/Exercise body height 468 → 424 px.
- Habit editor: wide two-column modal (name+colour / streaks+badges), actions and Save on one footer row; no scrolling.
- Streak badges now come from best streak up to today (`earnedBadges`), so imported history counts; Active Streaks rows show the current badge (🔥30). Favourites/History/Stats switch spans the card.
- Exercise Stats view: one cycling Week → Month → Year button with prev/next, tiles (days, sets, volume or reps) with change vs the previous period, sets chart that fills the card (values on bars, best day), top 3 exercises.

### 2026-11-18 (later)
- User imported their old Habit Tracker export through a temporary converter, then asked to remove it again (and the txt). Import reads Life Tracker backups only.
- Habits: future days can be ticked ahead (streak badges still only count up to today).
- Exercise layout slimmed: middle card is just the log form (muscles collapse to a one-line summary with Edit once filled in); right card toggles Favourites / History.
- Exercise favourites: `exercise.favorites` (SCHEMA_VERSION 2), logic in `features/exercise/favorites.js`. Star from the form or a history row; the Favourites list logs in one click with the latest entry's sets/reps/weight; ✓ when done today.

### 2026-11-18
- Added Archer push-up, Chest-supported row, Forearm curl, Power over (Athlean-X upper-abs move) to the catalogue (Bulgarian split squat already existed).
- Body map abs redrawn as a six-pack (three blocks per side + lower abs).
- Settings condensed: wider two-column modal, weight unit moved into General, import box hidden behind an Import button.

### 2026-11-13 (latest)
- Renamed GitHub repo Hydration-Hero → Life-Tracker (old URL redirects), pushed, set SEO description and 19 topics, added `docs/social-preview.png`.

### 2026-11-13 (later)
- Switched to a landscape layout at the user's request (they preferred the original Habit Tracker's wide month grid). Habits: full month grid + rings + streaks. Water/Exercise: three columns.
- Removed the one-time old-Habit-Tracker import converter, its guide and the old extension copy after the user confirmed the migration.

### 2026-11-13
- Merged Hydration Hero (React) with a React rebuild of the "Habit Tracker" store extension (compiled Vue, so not reused). Kept: grid, streaks, badge, reminders. Dropped: on-page widget, printable sheet, analytics.
- Moved storage from popup localStorage to `chrome.storage.local`; water now keeps daily history.
- Added Exercise tab with custom SVG body map; new name "Life Tracker" and new logo (three-colour pulse ending in a check).
- Fixed review findings: per-day water merge, import no longer overwrites reminders, past-month habit lists, storage write races.
