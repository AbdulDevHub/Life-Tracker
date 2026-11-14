// Backup export and import (Settings → Backup).
import { SCHEMA_VERSION } from "./defaults"
import { dayKey } from "./dates"

export const APP_ID = "life-tracker"

export function buildBackup({ habits, water, exercise, settings }, now = new Date()) {
  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    habits,
    water,
    exercise,
    settings,
  }
}

export const backupFileName = (now = new Date()) => `life-tracker-backup-${dayKey(now)}.json`

const summarize = (data) => {
  const habitIds = new Set()
  for (const list of Object.values(data.habits?.months || {})) list.forEach((h) => habitIds.add(h.id))
  const checks = Object.values(data.habits?.checks || {}).reduce((n, day) => n + Object.keys(day).length, 0)
  return {
    habits: habitIds.size,
    months: Object.keys(data.habits?.months || {}).length,
    checks,
    waterDays: Object.keys(data.water?.days || {}).length,
    workouts: data.exercise?.entries?.length || 0,
  }
}

/** Parse pasted or uploaded backup text into { data, summary }, or throw a readable error. */
export function parseImport(text) {
  let obj
  try {
    obj = JSON.parse(text.trim().replace(new RegExp("^﻿"), ""))
  } catch {
    throw new Error("That text is not valid JSON.")
  }
  if (!obj || obj.app !== APP_ID) throw new Error("Not a Life Tracker backup file.")
  const data = { habits: obj.habits, water: obj.water, exercise: obj.exercise, settings: obj.settings }
  try {
    return { data, summary: summarize(data) }
  } catch {
    throw new Error("This backup file is damaged and can't be read.")
  }
}

/** Merge imported habits into existing ones (union of months, check-offs and achievements). */
export function mergeHabits(current, incoming) {
  const months = { ...current.months }
  for (const [mk, list] of Object.entries(incoming.months || {})) {
    const have = months[mk] || []
    const ids = new Set(have.map((h) => h.id))
    months[mk] = [...have, ...list.filter((h) => !ids.has(h.id))]
  }
  const checks = { ...current.checks }
  for (const [day, val] of Object.entries(incoming.checks || {})) {
    checks[day] = { ...(checks[day] || {}), ...val }
  }
  const seen = new Set(current.achievements.map((a) => `${a.uuid}:${a.chainLength}`))
  const achievements = [
    ...current.achievements,
    ...(incoming.achievements || []).filter((a) => !seen.has(`${a.uuid}:${a.chainLength}`)),
  ]
  return { months, checks, achievements }
}

/** Merge water logs per day, skipping glasses already present (same time and amount). */
export function mergeWaterDays(current = {}, incoming = {}) {
  const days = { ...current }
  for (const [day, logs] of Object.entries(incoming)) {
    const have = days[day] || []
    const seen = new Set(have.map((l) => `${l.timestamp}|${l.volume}`))
    days[day] = [...have, ...logs.filter((l) => !seen.has(`${l.timestamp}|${l.volume}`))].sort((a, b) =>
      a.timestamp < b.timestamp ? -1 : 1,
    )
  }
  return days
}
