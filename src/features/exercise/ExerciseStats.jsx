import { useMemo, useState } from "react"
import { LuArrowDown, LuArrowUp, LuChevronLeft, LuChevronRight, LuRepeat2 } from "react-icons/lu"
import { parseDay } from "../../lib/dates"
import { cx } from "../../lib/util"
import { period, summarize } from "./stats"

const RANGES = ["week", "month", "year"]
const RANGE_LABEL = { week: "Week", month: "Month", year: "Year" }

const compact = (n) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`

function Delta({ now, before }) {
  const d = now - before
  if (!d) return <span className="text-muted/70">same</span>
  const up = d > 0
  return (
    <span className={cx("inline-flex items-center gap-px", up ? "text-emerald-600 dark:text-emerald-400" : "text-danger")}>
      {up ? <LuArrowUp /> : <LuArrowDown />}
      {compact(Math.abs(d))}
    </span>
  )
}

/** Week / month / year totals with a change vs the previous period, a sets chart and top exercises. */
export default function ExerciseStats({ entries, unit, today }) {
  const [range, setRange] = useState("week")
  const [offset, setOffset] = useState(0)
  const p = useMemo(() => period(range, offset, today), [range, offset, today])
  const s = useMemo(() => summarize(entries, p), [entries, p])
  const prev = useMemo(() => summarize(entries, period(range, offset + 1, today)), [entries, range, offset, today])
  const max = Math.max(1, ...s.bars)
  const best = s.bars.indexOf(Math.max(...s.bars))
  const dense = range === "month"
  const bestLabel = parseDay(p.buckets[best].from).toLocaleDateString(
    undefined,
    range === "week" ? { weekday: "short" } : range === "month" ? { month: "short", day: "numeric" } : { month: "short" },
  )

  const cycle = () => {
    setRange((r) => RANGES[(RANGES.indexOf(r) + 1) % RANGES.length])
    setOffset(0)
  }

  const useVolume = s.volume > 0 || prev.volume > 0
  const tiles = [
    { label: "Days", now: s.activeDays, before: prev.activeDays },
    { label: "Sets", now: s.sets, before: prev.sets },
    useVolume
      ? { label: unit, now: s.volume, before: prev.volume }
      : { label: "Reps", now: s.reps, before: prev.reps },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={cycle}
          className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent transition hover:bg-accent/25"
          title="Switch between week, month and year"
        >
          <LuRepeat2 /> {RANGE_LABEL[range]}
        </button>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          className="ml-1 rounded-md p-1 text-muted hover:bg-raised hover:text-ink"
          aria-label={`Previous ${range}`}
        >
          <LuChevronLeft />
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-xs font-bold text-ink">{p.title}</span>
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          disabled={offset === 0}
          className="rounded-md p-1 text-muted hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Next ${range}`}
        >
          <LuChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-raised/60 px-1 py-2 text-center">
            <p className="text-lg font-extrabold leading-none text-ink">{compact(t.now)}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{t.label}</p>
            <p className="mt-0.5 text-[10px] font-bold">
              <Delta now={t.now} before={t.before} />
            </p>
          </div>
        ))}
      </div>

      <div className="flex min-h-[96px] flex-1 flex-col">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="label">Sets per {range === "year" ? "month" : "day"}</span>
          {s.sets > 0 && (
            <span className="text-[10px] font-semibold text-muted">
              Best: {bestLabel} · {plural(s.bars[best], "set")}
            </span>
          )}
        </div>
        <div className={cx("flex min-h-0 flex-1 items-end", dense ? "gap-px" : "gap-1.5")}>
          {s.bars.map((v, i) => {
            const b = p.buckets[i]
            const current = b.from <= today && today <= b.to
            return (
              <div key={b.from} className="flex h-full flex-1 flex-col items-center justify-end">
                {!dense && v > 0 && <span className="mb-0.5 text-[10px] font-bold text-ink">{v}</span>}
                <div
                  className={cx(
                    "w-full rounded-t-[4px] transition-[height] duration-500",
                    v ? (current || offset > 0 ? "bg-accent" : "bg-accent/70") : current ? "bg-accent/35" : "bg-raised",
                  )}
                  style={{ height: v ? `${Math.max(6, (v / max) * 100)}%` : "4px" }}
                  title={`${b.from === b.to ? b.from : b.from.slice(0, 7)}: ${plural(v, "set")}`}
                />
              </div>
            )
          })}
        </div>
        <div className={cx("mt-1 flex text-[9px] font-bold", dense ? "gap-px" : "gap-1.5")}>
          {p.buckets.map((b) => {
            const current = b.from <= today && today <= b.to
            return (
              <span key={b.from} className={cx("flex-1 text-center", current ? "text-accent" : "text-muted")}>
                {b.label}
              </span>
            )
          })}
        </div>
      </div>

      <div>
        <p className="label mb-1.5">Top exercises</p>
        {s.top.length === 0 ? (
          <p className="text-xs text-muted">Nothing logged this {range}.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {s.top.slice(0, 3).map((x) => (
              <li key={x.name} className="flex items-center gap-2 text-xs">
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{x.name}</span>
                <span className="shrink-0 rounded-full bg-raised px-1.5 py-0.5 text-[10px] font-bold text-muted">
                  {plural(x.sets, "set")} · {x.sessions}×
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
