# Progress Tracker

Running log of where Life Tracker stands, so a new session can pick up where the last one stopped.
Update "Current state", "In progress" and "Next steps" after meaningful work, and add a dated entry to the session log (newest first). Fold stale entries into "Earlier history".

## Current state
- v2.0.0 builds and passes lint + unit tests. The user's habit history has been imported and checked.
- Landscape popup (800 px wide, height follows content).
- Habits: month grid (habits × days), month/week/today rings, active-streaks panel, streak badges (7/21/30/66/100), editor (rename, colour, reorder, remove from month onward).
- Water: progress tank, glass presets + custom, today log with delete, 7-day chart, 3 AM rollover, goal editing.
- Exercise: front/back SVG muscle map (today / 7 days), log form with a 60+ exercise catalogue, history grouped by day with filter and re-log.
- Settings: theme, toolbar badge, habit/water reminders, kg/lb, JSON backup export/import (merge or replace), reset.
- Service worker: badge = habits left today; alarms for reminders.

## In progress
- Nothing open.

## Next steps
- User: upload `docs/social-preview.png` in GitHub Settings → General → Social preview (no API for it).
- Optional: publish to the Chrome Web Store, then add the store link as the repo homepage.
- Ideas the user may pick: sleep tab, mood/journal tab, focus timer, weekly review; exercise personal records, rest timer, workout templates.

## Session log
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
