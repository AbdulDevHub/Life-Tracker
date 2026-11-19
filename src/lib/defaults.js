// 2: exercise.favorites added
export const SCHEMA_VERSION = 2

export const DEFAULT_HABIT_COLOR = "#8b5cf6"

export const defaultHabits = () => ({
  // "YYYY-MM" -> [{ id, title, color }]. A month without its own list inherits the latest earlier one.
  months: {},
  // "YYYY-MM-DD" -> { [habitId]: true }
  checks: {},
  // [{ uuid, chainLength, date }]
  achievements: [],
})

export const defaultWater = () => ({
  goal: 2000,
  selected: 400,
  // waterDayKey -> [{ volume, timestamp }]
  days: {},
})

export const defaultExercise = () => ({
  unit: "kg",
  // [{ id, day, timestamp, name, muscles: [], sets, reps, weight }]
  entries: [],
  // [{ name, muscles: [], sets, reps, weight }] logged in one click; see features/exercise/favorites.js
  favorites: [],
})

export const defaultSettings = () => ({
  theme: "dark",
  tab: "habits",
  showBadge: true,
  reminders: { habits: "off", water: "off" },
})
