import { useEffect, useState } from "react"
import { LuX } from "react-icons/lu"

import { cx } from "../lib/util"

export function Button({ variant = "primary", size = "md", className, ...props }) {
  const variants = {
    primary: "bg-accent text-white hover:brightness-110 shadow-sm shadow-accent/20",
    soft: "bg-accent/15 text-accent hover:bg-accent/25",
    ghost: "bg-raised text-ink hover:bg-line",
    danger: "bg-danger/15 text-danger hover:bg-danger/25",
  }
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm" }
  return (
    <button
      type="button"
      className={cx(
        "inline-flex select-none items-center justify-center gap-1.5 rounded-full font-bold transition active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function IconButton({ label, className, children, ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cx(
        "grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-raised hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ className, ...props }) {
  return (
    <div className={cx("rounded-2xl border border-line bg-surface p-4", className)} {...props} />
  )
}

/** Small pill group used for view and setting choices. */
export function Segmented({ value, onChange, options, className, size = "sm" }) {
  return (
    <div className={cx("inline-flex rounded-full bg-raised p-0.5", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-full font-semibold transition",
            size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
            value === o.value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "flex max-h-full w-full animate-fadeIn flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl",
          wide ? "max-w-lg" : "max-w-sm",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <LuX />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}

export function Switch({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-accent" : "bg-line",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </label>
  )
}

/** Circular progress ring. value is 0..1. */
export function Ring({ value, size = 44, stroke = 5, children, color = "rgb(var(--accent))" }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--raised))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-bold">{children}</div>
    </div>
  )
}

export function EmptyState({ icon, title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-xl text-accent">
        {icon}
      </div>
      <p className="text-sm font-bold">{title}</p>
      {children && <div className="text-xs text-muted">{children}</div>}
    </div>
  )
}


export function Toaster() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const onToast = (e) => {
      const id = Math.random()
      setItems((xs) => [...xs, { id, message: e.detail }])
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200)
    }
    window.addEventListener("lt-toast", onToast)
    return () => window.removeEventListener("lt-toast", onToast)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex flex-col items-center gap-2 px-3">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-fadeIn rounded-full bg-ink px-4 py-2 text-xs font-semibold text-base shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

