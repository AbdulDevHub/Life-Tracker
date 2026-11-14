# Architecture

How Life Tracker's pieces fit together and what each storage key holds.
Read before changing data shapes, the service worker, or import/export. Update it when a key, shape or data flow changes.

## Pieces
- **Popup / full tab** (`index.html`, `src/`): one React app. `?view=tab` adds `html.full` and lifts the 800 px popup width.
- **Service worker** (`public/background.js`): reads storage only. Sets the toolbar badge and runs reminder alarms. Reschedules alarms when `lt.settings.reminders` changes.
- **Storage** (`src/lib/storage.js`): `chrome.storage.local` with a localStorage fallback (dev/screenshots). `useStored(key, defaultFactory)` gives React state that writes through and listens for changes from other pages.

## Storage keys (schema v1)
```text
lt.habits   { months: { "YYYY-MM": [{ id, title, color }] },
              checks: { "YYYY-MM-DD": { [id]: true } },
              achievements: [{ uuid, chainLength, date? }] }
lt.water    { goal, selected, days: { waterDayKey: [{ volume, timestamp }] } }   // day rolls over at 3 AM
lt.exercise { unit: "kg"|"lb", entries: [{ id, day, timestamp, name, muscles[], sets, reps, weight|null }] }
lt.settings { theme, tab, showBadge, reminders: { habits: off|daily|hourly, water: off|"60"|"120" } }
```

## Rules worth knowing
- A month with no habit list inherits the latest earlier list, but only for the current month or later (`habitsForMonth`). Edits copy the list into the month first.
- Title/colour edits apply to every month; removal applies from the viewed month onward, so history stays.
- Check-offs are stored by habit id, not by month, so a habit's streak runs across month boundaries.
- Import (`src/lib/importExport.js`): `parseImport` only accepts Life Tracker backups (`app: "life-tracker"`). Merge unions habits, check-offs, water logs per day and exercise entries by id. The one-time converter for the old Habit Tracker extension was removed after migration (see git history).
