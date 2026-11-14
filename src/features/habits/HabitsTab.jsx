import { useMemo, useState } from "react"
import { LuCheck, LuChevronLeft, LuChevronRight, LuFlame, LuListChecks, LuPlus } from "react-icons/lu"
import { Card, EmptyState, Ring } from "../../components/ui"
import { addDays, addMonths, dayKey, daysInMonth, monthKey, startOfWeek } from "../../lib/dates"
import { defaultHabits } from "../../lib/defaults"
import { KEYS } from "../../lib/storage"
import { useStored } from "../../lib/useStore"
import { celebrate, cx, toast } from "../../lib/util"
import { HABIT_COLORS } from "./colors"
import HabitEditor from "./HabitEditor"
import { addHabit, currentStreak, habitsForMonth, isChecked, newMilestones, toggleCheck } from "./habitLogic"

const SUGGESTIONS = ["📖 Read 10 pages", "🧘 Stretch", "🛌 Sleep by 11", "🚶 10k steps"]

/** Share of (habit, day) pairs checked off. */
function completion(habits, list, dayKeys) {
  if (!list.length || !dayKeys.length) return 0
  let done = 0
  for (const k of dayKeys) for (const h of list) if (isChecked(habits, k, h.id)) done++
  return done / (list.length * dayKeys.length)
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Ring value={value} size={62} stroke={7}>
        <span className="text-[13px] font-extrabold">{Math.round(value * 100)}%</span>
      </Ring>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
    </div>
  )
}

export default function HabitsTab({ isFull }) {
  const [habits, setHabits, loaded] = useStored(KEYS.habits, defaultHabits)
  const [anchor, setAnchor] = useState(() => new Date())
  const [draft, setDraft] = useState("")
  const [editing, setEditing] = useState(null)

  const now = new Date()
  const today = dayKey(now)
  const mk = monthKey(anchor)
  const list = habitsForMonth(habits, mk)
  const todayList = habitsForMonth(habits, monthKey(now))

  const days = useMemo(() => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    return Array.from({ length: daysInMonth(first) }, (_, i) => addDays(first, i))
  }, [anchor])

  const monthPct = completion(habits, list, days.map(dayKey).filter((k) => k <= today))
  const weekKeys = Array.from({ length: 7 }, (_, i) => dayKey(addDays(startOfWeek(now), i))).filter((k) => k <= today)
  const weekPct = completion(habits, todayList, weekKeys)
  const dayPct = completion(habits, todayList, [today])

  const streaks = todayList
    .map((h) => ({ h, n: currentStreak(habits, h.id, today) }))
    .filter((s) => s.n > 0)
    .sort((a, b) => b.n - a.n)
  const maxStreak = streaks[0]?.n || 1

  const toggle = (habit, day) => {
    const wasChecked = isChecked(habits, day, habit.id)
    setHabits((h) => {
      let next = toggleCheck(h, day, habit.id)
      if (!wasChecked) {
        const reached = newMilestones(next, habit.id, day)
        if (reached.length) {
          next = {
            ...next,
            achievements: [...next.achievements, ...reached.map((m) => ({ uuid: habit.id, chainLength: m, date: day }))],
          }
          setTimeout(() => {
            celebrate()
            toast(`🔥 ${reached[reached.length - 1]}-day streak: ${habit.title}`)
          }, 0)
        }
      }
      return next
    })
  }

  const add = (title) => {
    if (!title.trim()) return
    setHabits((h) => addHabit(h, mk, title, HABIT_COLORS[list.length % HABIT_COLORS.length]))
    setDraft("")
  }

  if (!loaded) return null

  const nameCol = isFull ? 200 : 150
  const gridStyle = { gridTemplateColumns: `${nameCol}px repeat(${days.length}, minmax(0, 1fr))` }

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex shrink-0 items-center gap-6 py-3">
        <div className="flex w-[150px] items-center gap-1">
          <button
            type="button"
            onClick={() => setAnchor((a) => addMonths(a, -1))}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink"
            aria-label="Previous month"
          >
            <LuChevronLeft />
          </button>
          <button type="button" onClick={() => setAnchor(new Date())} className="flex-1 text-center" title="Jump to this month">
            <span className="block text-lg font-extrabold leading-tight">
              {anchor.toLocaleDateString(undefined, { month: "long" })}
            </span>
            <span className="text-xs font-semibold text-muted">{anchor.getFullYear()}</span>
          </button>
          <button
            type="button"
            onClick={() => setAnchor((a) => addMonths(a, 1))}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink"
            aria-label="Next month"
          >
            <LuChevronRight />
          </button>
        </div>

        <Stat label="Month" value={monthPct} />
        <Stat label="Week" value={weekPct} />
        <Stat label="Today" value={dayPct} />

        <div className="flex max-h-[112px] min-h-[92px] min-w-0 flex-1 flex-col rounded-xl bg-raised/60 px-3 py-2">
          <span className="label mb-1 flex items-center gap-1">
            <LuFlame className="text-lift" /> Active streaks
          </span>
          {streaks.length === 0 ? (
            <p className="text-xs text-muted">Check off a habit to start one.</p>
          ) : (
            <ul className="flex flex-col gap-1 overflow-y-auto pr-1">
              {streaks.map(({ h, n }) => (
                <li key={h.id} className="flex items-center gap-2 text-xs">
                  <span className="w-[42%] truncate font-semibold">{h.title}</span>
                  <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${Math.max(6, (n / maxStreak) * 100)}%`, background: h.color }}
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right text-[11px] font-extrabold">
                    {n} {n === 1 ? "day" : "days"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="flex flex-col px-3 py-3">
        {/* Header: add field + weekday and date columns */}
        <div className="grid shrink-0 items-end gap-x-[3px]" style={gridStyle}>
          <form
            className="row-span-2 mr-2 flex h-8 items-center gap-1 self-end rounded-lg border border-line bg-raised pl-2.5 pr-1 focus-within:border-accent"
            onSubmit={(e) => {
              e.preventDefault()
              add(draft)
            }}
          >
            <input
              className="w-full min-w-0 bg-transparent text-xs placeholder:text-muted/80 focus:outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add new habit"
              aria-label="New habit"
              maxLength={60}
            />
            <button type="submit" disabled={!draft.trim()} className="grid h-6 w-6 place-items-center rounded-md text-muted hover:text-accent disabled:opacity-40" aria-label="Add habit">
              <LuPlus />
            </button>
          </form>
          {days.map((d) => {
            const k = dayKey(d)
            const weekend = d.getDay() === 0 || d.getDay() === 6
            return (
              <div
                key={`w${k}`}
                className={cx(
                  "rounded-t-md pt-1 text-center text-[8.5px] font-semibold leading-none",
                  weekend && "bg-raised/70",
                  k === today ? "text-accent" : "text-muted",
                )}
              >
                {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
              </div>
            )
          })}
          {days.map((d) => {
            const k = dayKey(d)
            const weekend = d.getDay() === 0 || d.getDay() === 6
            return (
              <div
                key={`d${k}`}
                className={cx(
                  "rounded-b-md pb-1 pt-0.5 text-center text-[11px] font-bold",
                  weekend && "bg-raised/70",
                  k === today ? "text-accent" : "text-ink/80",
                )}
              >
                {d.getDate()}
              </div>
            )
          })}
        </div>

        {list.length === 0 ? (
          <EmptyState icon={<LuListChecks />} title="No habits this month">
            Type one in the box above, or pick one:
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => add(s)} className="rounded-full bg-raised px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-line">
                  {s}
                </button>
              ))}
            </div>
          </EmptyState>
        ) : (
          <div className="-mr-1 mt-1.5 max-h-[300px] overflow-y-auto pr-1">
            <div className="grid items-center gap-x-[3px] gap-y-1.5" style={gridStyle}>
              {list.map((h) => (
                <Row key={h.id} habit={h} days={days} today={today} habits={habits} onToggle={toggle} onEdit={() => setEditing(h)} />
              ))}
            </div>
          </div>
        )}
      </Card>

      <HabitEditor habit={editing} monthKey={mk} habits={habits} setHabits={setHabits} onClose={() => setEditing(null)} />
    </div>
  )
}

function Row({ habit, days, today, habits, onToggle, onEdit }) {
  return (
    <>
      <button type="button" onClick={onEdit} className="mr-2 flex min-w-0 items-center gap-2 text-left" title={`Edit ${habit.title}`}>
        <span className="h-3.5 w-1 shrink-0 rounded-full" style={{ background: habit.color }} />
        <span className="truncate text-[13px] font-semibold">{habit.title}</span>
      </button>
      {days.map((d) => {
        const k = dayKey(d)
        const checked = isChecked(habits, k, habit.id)
        const future = k > today
        return (
          <button
            key={k}
            type="button"
            disabled={future}
            onClick={() => onToggle(habit, k)}
            aria-pressed={checked}
            aria-label={`${habit.title}, ${d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}`}
            title={d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            style={checked ? { background: habit.color, borderColor: habit.color } : undefined}
            className={cx(
              "grid aspect-square w-full place-items-center rounded-[5px] border text-white transition",
              checked ? "animate-pop" : "border-transparent bg-raised hover:border-muted/60",
              k === today && !checked && "border-accent/80 ring-1 ring-accent/40",
              future && "opacity-40",
            )}
          >
            {checked && <LuCheck strokeWidth={4} className="h-2.5 w-2.5" />}
          </button>
        )
      })}
    </>
  )
}
