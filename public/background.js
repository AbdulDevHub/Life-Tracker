// Life Tracker service worker: toolbar badge (habits left today) and reminders.
// Plain JS copied as-is by Vite; keep the date logic in sync with src/lib/dates.js.

const KEYS = { habits: "lt.habits", water: "lt.water", settings: "lt.settings" }
const ALARM = { tick: "lt-tick", habits: "lt-habits", water: "lt-water" }
const WATER_RESET_HOUR = 3

const pad = (n) => String(n).padStart(2, "0")
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
const waterDayKey = (d) => dayKey(new Date(d.getTime() - WATER_RESET_HOUR * 3600 * 1000))

async function load() {
  const r = await chrome.storage.local.get(Object.values(KEYS))
  return {
    habits: r[KEYS.habits] || { months: {}, checks: {} },
    water: r[KEYS.water] || { goal: 2000, days: {} },
    settings: r[KEYS.settings] || {},
  }
}

function habitsLeft(habits, now = new Date()) {
  const mk = monthKey(now)
  let list = habits.months?.[mk]
  if (!list) {
    const earlier = Object.keys(habits.months || {}).filter((k) => k < mk).sort()
    list = earlier.length ? habits.months[earlier[earlier.length - 1]] : []
  }
  const done = habits.checks?.[dayKey(now)] || {}
  return list.filter((h) => !done[h.id]).length
}

function waterToday(water, now = new Date()) {
  return (water.days?.[waterDayKey(now)] || []).reduce((s, l) => s + Number(l.volume || 0), 0)
}

async function updateBadge() {
  const { habits, settings } = await load()
  const left = habitsLeft(habits)
  const show = settings.showBadge !== false && left > 0
  await chrome.action.setBadgeBackgroundColor({ color: "#22d3ee" })
  await chrome.action.setBadgeTextColor?.({ color: "#0b1220" })
  await chrome.action.setBadgeText({ text: show ? String(left) : "" })
}

function nextAt(hour) {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  if (d <= new Date()) d.setDate(d.getDate() + 1)
  return d.getTime()
}

async function scheduleAlarms() {
  const { settings } = await load()
  const r = settings.reminders || {}
  await chrome.alarms.clear(ALARM.habits)
  await chrome.alarms.clear(ALARM.water)
  if (r.habits === "daily") chrome.alarms.create(ALARM.habits, { when: nextAt(20), periodInMinutes: 1440 })
  if (r.habits === "hourly") chrome.alarms.create(ALARM.habits, { delayInMinutes: 60, periodInMinutes: 60 })
  const mins = Number(r.water)
  if (mins > 0) chrome.alarms.create(ALARM.water, { delayInMinutes: mins, periodInMinutes: mins })
  // Refresh the badge after midnight and on a slow heartbeat.
  chrome.alarms.create(ALARM.tick, { when: nextAt(0) + 5000, periodInMinutes: 60 })
}

function notify(id, title, message) {
  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
    priority: 1,
  })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM.tick) return updateBadge()
  const { habits, water } = await load()
  if (alarm.name === ALARM.habits) {
    const left = habitsLeft(habits)
    if (left > 0) notify("lt-habits", "Life Tracker", `${left} habit${left === 1 ? "" : "s"} left today. Keep the streak going! 🔥`)
  }
  if (alarm.name === ALARM.water) {
    const hour = new Date().getHours()
    const total = waterToday(water)
    const goal = water.goal || 2000
    if (hour >= 8 && hour < 22 && total < goal) {
      notify("lt-water", "Time for some water 💧", `${(total / 1000).toFixed(1)} of ${(goal / 1000).toFixed(1)} L so far today.`)
    }
  }
})

chrome.notifications.onClicked.addListener((id) => {
  chrome.notifications.clear(id)
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html?view=tab") })
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return
  if (KEYS.habits in changes || KEYS.settings in changes) updateBadge()
  if (KEYS.settings in changes) {
    const before = changes[KEYS.settings].oldValue?.reminders
    const after = changes[KEYS.settings].newValue?.reminders
    if (JSON.stringify(before) !== JSON.stringify(after)) scheduleAlarms()
  }
})

chrome.runtime.onInstalled.addListener(() => {
  scheduleAlarms()
  updateBadge()
})
chrome.runtime.onStartup.addListener(() => {
  scheduleAlarms()
  updateBadge()
})
