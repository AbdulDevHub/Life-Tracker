export const SCHEMA_VERSION = 1

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
})

export const defaultSettings = () => ({
  theme: "dark",
  tab: "habits",
  showBadge: true,
  reminders: { habits: "off", water: "off" },
})
