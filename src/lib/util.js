import confetti from "canvas-confetti"

/** Join class names, skipping falsy ones. */
export const cx = (...c) => c.filter(Boolean).join(" ")

/** Show a toast from anywhere (rendered by <Toaster/>). */
export const toast = (message) =>
  window.dispatchEvent(new CustomEvent("lt-toast", { detail: message }))

/** Short confetti burst in the tab's colour. */
export function celebrate(colors = ["#9d78fa", "#1cabe3", "#f98028"]) {
  const end = Date.now() + 1200
  ;(function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors, disableForReducedMotion: true })
    confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors, disableForReducedMotion: true })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

/** Trigger a file download of JSON data. */
export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
