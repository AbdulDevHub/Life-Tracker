// Date helpers. All keys use the user's local time zone.
export const pad = (n) => String(n).padStart(2, "0")

/** "YYYY-MM-DD" for a Date. */
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** "YYYY-MM" for a Date. */
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

/** Date at local midnight from "YYYY-MM-DD". */
export const parseDay = (key) => {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const parseMonth = (key) => {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1)
}

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)
export const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

/** Monday of the week that contains d. */
export const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7))

/** The water "day" rolls over at 3 AM, so a late-night glass counts for the evening before. */
export const WATER_RESET_HOUR = 3
export const waterDayKey = (now = new Date()) =>
  dayKey(new Date(now.getTime() - WATER_RESET_HOUR * 3600 * 1000))

export const timeAgo = (iso, now = new Date()) => {
  const mins = Math.floor((now - new Date(iso)) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export const clockTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
