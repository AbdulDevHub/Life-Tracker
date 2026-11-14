import { lazy, Suspense, useEffect, useState } from "react"
import { LuDroplet, LuDumbbell, LuExternalLink, LuListChecks, LuMoon, LuSettings, LuSun } from "react-icons/lu"
import Logo from "./components/Logo"
import SettingsSheet from "./components/SettingsSheet"
import { IconButton, Toaster } from "./components/ui"
import HabitsTab from "./features/habits/HabitsTab"
import WaterTab from "./features/water/WaterTab"
import { defaultSettings } from "./lib/defaults"
import { KEYS } from "./lib/storage"
import { useStored } from "./lib/useStore"
import { cx } from "./lib/util"

const ExerciseTab = lazy(() => import("./features/exercise/ExerciseTab"))

const TABS = [
  { id: "habits", label: "Habits", icon: LuListChecks, accent: "var(--habit)" },
  { id: "water", label: "Water", icon: LuDroplet, accent: "var(--water)" },
  { id: "exercise", label: "Exercise", icon: LuDumbbell, accent: "var(--lift)" },
]

export default function App({ isFull }) {
  const [settings, setSettings] = useStored(KEYS.settings, defaultSettings)
  const [showSettings, setShowSettings] = useState(false)
  const tab = TABS.find((t) => t.id === settings.tab) || TABS[0]

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme !== "light")
  }, [settings.theme])

  const setTab = (id) => setSettings((s) => ({ ...s, tab: id }))
  const toggleTheme = () =>
    setSettings((s) => ({ ...s, theme: s.theme === "light" ? "dark" : "light" }))

  const openFull = () => {
    const url = (globalThis.chrome?.runtime?.getURL?.("index.html") ?? "index.html") + "?view=tab"
    if (globalThis.chrome?.tabs?.create) globalThis.chrome.tabs.create({ url })
    else window.open(url, "_blank")
    window.close()
  }

  return (
    <div
      className={cx(
        "mx-auto flex flex-col",
        isFull ? "min-h-screen max-w-6xl px-6 py-6" : "w-[800px]",
      )}
      style={{ "--accent": tab.accent }}
    >
      <header className={cx("grid grid-cols-[1fr_auto_1fr] items-center gap-3", isFull ? "pb-5" : "px-4 pb-2 pt-3")}>
        <div className="flex items-center gap-2">
          <Logo size={isFull ? 32 : 26} />
          <h1 className={cx("font-extrabold tracking-tight", isFull ? "text-xl" : "text-[15px]")}>Life Tracker</h1>
        </div>

        <nav className="flex gap-1 rounded-full bg-surface p-1" aria-label="Trackers">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = t.id === tab.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                style={{ "--accent": t.accent }}
                className={cx(
                  "flex w-28 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition",
                  active ? "bg-accent/15 text-accent" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="text-sm" />
                {t.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center justify-end">
          {!isFull && (
            <IconButton label="Open in a full tab" onClick={openFull}>
              <LuExternalLink />
            </IconButton>
          )}
          <IconButton label={settings.theme === "light" ? "Dark mode" : "Light mode"} onClick={toggleTheme}>
            {settings.theme === "light" ? <LuMoon /> : <LuSun />}
          </IconButton>
          <IconButton label="Settings" onClick={() => setShowSettings(true)}>
            <LuSettings />
          </IconButton>
        </div>
      </header>

      <main className={cx("min-h-0 flex-1", isFull ? "" : "px-4 pb-4 pt-1")}>
        {tab.id === "habits" && <HabitsTab isFull={isFull} />}
        {tab.id === "water" && <WaterTab isFull={isFull} />}
        {tab.id === "exercise" && (
          <Suspense fallback={null}>
            <ExerciseTab isFull={isFull} />
          </Suspense>
        )}
      </main>

      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
      />
      <Toaster />
    </div>
  )
}
