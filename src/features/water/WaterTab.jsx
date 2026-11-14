import { useEffect, useState } from "react"
import { LuDroplet, LuPencil, LuPlus, LuX } from "react-icons/lu"
import { Button, Card, EmptyState } from "../../components/ui"
import { addDays, clockTime, dayKey, parseDay, timeAgo, waterDayKey } from "../../lib/dates"
import { defaultWater } from "../../lib/defaults"
import { KEYS } from "../../lib/storage"
import { useStored } from "../../lib/useStore"
import { celebrate, cx, toast } from "../../lib/util"

const PRESETS = [150, 250, 400, 500, 750]
const liters = (ml) => (ml / 1000).toFixed(ml % 100 === 0 ? 1 : 2).replace(/0$/, "")

/** Re-render every minute so "x min ago" and the 3 AM rollover stay fresh. */
function useMinuteTick() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])
}

function ProgressTank({ total, goal, pulse }) {
  const pct = goal ? Math.min(100, (total / goal) * 100) : 0
  const message =
    total >= goal ? "Goal reached! 🎉" : total >= goal / 2 ? "Keep it up! 💪" : "Drink up! 💧"
  const onFill = pct > 52
  return (
    <div
      className={cx(
        "relative h-full min-h-[200px] overflow-hidden rounded-2xl border border-line bg-surface",
        pulse && "animate-pulsate",
      )}
    >
      <div
        className="absolute inset-x-0 bottom-0 bg-water transition-[height] duration-1000 ease-out"
        style={{ height: `${pct}%` }}
      >
        {pct > 0 && pct < 100 && (
          <svg className="absolute -top-2 left-0 h-3 w-[200%] animate-[wave_6s_linear_infinite] text-water" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 5 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 V10 H0Z" fill="currentColor" />
          </svg>
        )}
      </div>
      <div className="relative flex h-full flex-col justify-between p-4">
        <div>
          <p className={cx("text-4xl font-extrabold tracking-tight", onFill && "text-white")}>
            {pct.toFixed(0)}%
          </p>
          <p className={cx("text-sm font-semibold", onFill ? "text-white/85" : "text-muted")}>{message}</p>
        </div>
        <p className={cx("text-[13px] font-bold", pct > 18 ? "text-white" : "text-muted")}>
          {liters(total)} of {liters(goal)} L
        </p>
      </div>
    </div>
  )
}

function WeekBars({ days, goal }) {
  const today = waterDayKey()
  const keys = Array.from({ length: 7 }, (_, i) => addDays(parseDay(today), i - 6))
  const totals = keys.map((d) => {
    const k = dayKey(d)
    return { d, total: (days[k] || []).reduce((s, l) => s + Number(l.volume), 0) }
  })
  const max = Math.max(goal, ...totals.map((t) => t.total))
  return (
    <div className="relative mt-auto flex h-[190px] items-end gap-2 pt-2">
      <div
        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-water/60"
        style={{ bottom: `${(goal / max) * 150 + 16}px` }}
        title={`Goal ${liters(goal)} L`}
      />
      {totals.map(({ d, total }) => (
        <div key={d.getTime()} className="flex flex-1 flex-col items-center gap-1" title={`${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}: ${liters(total)} L`}>
          <div className="flex h-[150px] w-full items-end">
            <div
              className={cx("w-full rounded-md transition-[height] duration-700", total >= goal ? "bg-water" : "bg-water/40")}
              style={{ height: `${Math.max(total ? 6 : 2, (total / max) * 150)}px` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-muted">
            {d.toLocaleDateString(undefined, { weekday: "narrow" })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function WaterTab({ isFull }) {
  useMinuteTick()
  const [water, setWater, loaded] = useStored(KEYS.water, defaultWater)
  const [custom, setCustom] = useState("")
  const [pulse, setPulse] = useState(false)
  const [editGoal, setEditGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState("")

  const dk = waterDayKey()
  const logs = water.days[dk] || []
  const total = logs.reduce((s, l) => s + Number(l.volume), 0)
  const volume = Number(custom) || water.selected

  const log = () => {
    if (!volume || volume <= 0) return
    const before = total
    setWater((w) => ({
      ...w,
      days: { ...w.days, [dk]: [...(w.days[dk] || []), { volume, timestamp: new Date().toISOString() }] },
    }))
    setCustom("")
    setPulse(true)
    setTimeout(() => setPulse(false), 500)
    if (before < water.goal && before + volume >= water.goal) {
      celebrate(["#1cabe3", "#7dd3fc", "#ffffff"])
      toast("💧 Daily water goal reached!")
    }
  }

  const remove = (i) =>
    setWater((w) => {
      const list = (w.days[dk] || []).filter((_, j) => j !== i)
      const days = { ...w.days }
      if (list.length) days[dk] = list
      else delete days[dk]
      return { ...w, days }
    })

  const saveGoal = () => {
    const g = Math.round(Number(goalDraft))
    if (g >= 250 && g <= 10000) setWater((w) => ({ ...w, goal: g }))
    setEditGoal(false)
  }

  if (!loaded) return null

  return (
    <div className={cx("grid grid-cols-[230px_minmax(0,1fr)_230px] gap-3", isFull ? "min-h-[460px]" : "h-[468px]")}>
      <ProgressTank total={total} goal={water.goal} pulse={pulse} />
      <div className="flex min-h-0 flex-col gap-3">

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="label">Glass size</span>
          {editGoal ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault()
                saveGoal()
              }}
            >
              <input
                type="number"
                className="field h-7 w-20 py-0 text-xs"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                min={250}
                max={10000}
                step={100}
                autoFocus
                aria-label="Daily goal in ml"
              />
              <span className="text-xs text-muted">ml</span>
              <Button size="sm" type="submit" className="h-7">
                Save
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setGoalDraft(String(water.goal))
                setEditGoal(true)
              }}
              className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
            >
              Goal {liters(water.goal)} L <LuPencil className="text-[11px]" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setCustom("")
                setWater((w) => ({ ...w, selected: p }))
              }}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                !custom && water.selected === p ? "bg-water text-white" : "bg-raised text-ink hover:bg-line",
              )}
            >
              {p} ml
            </button>
          ))}
          <input
            type="number"
            inputMode="numeric"
            className="field h-[30px] w-[78px] rounded-full px-3 py-0 text-xs"
            placeholder="Other"
            value={custom}
            min={1}
            max={3000}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && log()}
            aria-label="Custom amount in ml"
          />
        </div>
        <Button onClick={log} disabled={!volume || volume <= 0}>
          <LuPlus /> Log {volume || 0} ml
        </Button>
      </Card>

      <Card className="flex flex-1 flex-col">
        <span className="label">Last 7 days</span>
        <WeekBars days={water.days} goal={water.goal} />
      </Card>
      </div>

      <Card className="flex min-h-0 flex-col p-0">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="label">Today</span>
          <span className="text-xs font-bold text-water">{liters(total)} L</span>
        </div>
        {logs.length === 0 ? (
          <EmptyState icon={<LuDroplet />} title="No drinks logged yet">
            The day resets at 3 AM.
          </EmptyState>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {logs
              .map((l, i) => ({ ...l, i }))
              .reverse()
              .map((l) => (
                <li key={l.i} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-raised">
                  <LuDroplet className="text-water" />
                  <span className="text-sm font-bold">{l.volume} ml</span>
                  <span className="ml-auto text-xs text-muted" title={clockTime(l.timestamp)}>
                    {timeAgo(l.timestamp)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(l.i)}
                    className="text-muted opacity-0 transition hover:text-danger focus:opacity-100 group-hover:opacity-100"
                    aria-label={`Remove ${l.volume} ml`}
                  >
                    <LuX />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
