import { MUSCLE_LABEL } from "./catalog"

// Stylised male figure, front and back, in a 200x400 box. Paths describe the
// figure's left half (x <= 100); the right half is the same paths mirrored.
const SILHOUETTE = {
  torso:
    "M100 56 L92 56 C88 62 82 65 74 67 C64 69 58 76 57 86 L60 104 C64 116 67 128 69 140 C71 152 73 162 75 172 C73 182 73 190 75 198 L100 210 Z",
  arm:
    "M72 69 C59 69 50 78 49 92 C47 108 47 124 48 140 C45 156 43 176 43 196 C42 206 42 214 44 222 C45 230 48 236 52 236 C56 236 57 230 56 222 C55 214 55 206 56 198 C59 180 63 160 64 144 C66 128 67 112 66 98 Z",
  leg:
    "M75 194 C71 214 70 240 71 262 C72 276 74 286 74 296 C71 316 71 338 74 358 C74 366 70 374 72 381 L87 381 C87 372 84 364 84 356 C87 336 88 316 86 298 C88 286 90 276 92 262 C95 244 97 226 98 212 L100 212 L100 198 Z",
}

// One rounded ab block (left of the midline gap), from y0 to y1.
const abBlock = (y0, y1, x0 = 88.5, x1 = 98.5, r = 2.5) =>
  `M${x0 + r} ${y0} L${x1 - 1} ${y0} Q${x1} ${y0} ${x1} ${y0 + 1} L${x1} ${y1 - 1} Q${x1} ${y1} ${x1 - 1} ${y1} ` +
  `L${x0 + r} ${y1} Q${x0} ${y1} ${x0} ${y1 - r} L${x0} ${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`

// Six-pack: three stacked blocks plus the tapering lower abs.
const ABS =
  abBlock(116, 131, 89.5) + abBlock(133, 148) + abBlock(150, 164) +
  "M88.5 166 L98.5 166 L98.5 182 C95 182 91 178 89 172 Z"

const FRONT = [
  ["traps", "M93 54 L93 62 C88 64 82 66 76 68 C82 62 88 58 93 54 Z"],
  ["frontDelts", "M77 69 C67 70 59 77 57 89 C56 95 57 100 59 104 C66 102 72 98 77 93 C79 86 81 78 81 71 Z"],
  ["sideDelts", "M70 69 C60 70 52 78 50 92 C50 98 51 102 53 106 C54 97 55 89 58 83 C61 76 65 72 70 69 Z"],
  ["chest", "M81 71 C88 69 96 71 99 73 L99 108 C92 114 82 114 77 110 C73 106 73 98 77 93 C79 87 81 79 81 71 Z"],
  ["biceps", "M55 108 C51 118 50 129 51 140 C55 144 60 144 63 140 C65 128 65 116 62 104 C59 104 57 105 55 108 Z"],
  ["forearms", "M50 147 C47 161 45 178 45 195 C48 197 52 197 55 195 C58 180 61 164 63 147 C58 149 54 149 50 147 Z"],
  ["abs", ABS],
  ["obliques", "M77 115 C80 117 84 117 86 117 C85 134 85 152 86 170 C82 168 79 162 78 154 C76 141 75 128 77 115 Z"],
  ["quads", "M78 200 C74 222 72 248 75 276 C80 282 88 282 92 276 C95 256 96 232 95 212 C89 208 83 204 78 200 Z"],
  ["adductors", "M96 213 C98 215 99 217 99 219 L99 236 C97 248 95 258 93 266 C95 248 96 230 96 213 Z"],
  ["calves", "M75 299 C72 316 72 336 75 352 C78 354 81 354 83 352 C85 334 85 316 84 300 C81 298 78 297 75 299 Z"],
]

const BACK = [
  ["traps", "M100 50 L92 54 C88 60 82 64 75 68 C83 74 90 84 95 97 L100 110 Z"],
  ["sideDelts", "M70 70 C60 70 52 78 51 92 C51 98 52 102 54 105 C55 97 56 91 57 88 C59 79 64 73 70 70 Z"],
  ["rearDelts", "M73 70 C66 72 60 78 58 88 C64 90 70 88 76 84 C77 78 76 73 73 70 Z"],
  ["triceps", "M55 108 C51 118 50 129 51 140 C55 144 60 144 63 140 C65 128 65 116 62 102 C59 102 57 104 55 108 Z"],
  ["forearms", "M50 147 C47 161 45 178 45 195 C48 197 52 197 55 195 C58 180 61 164 63 147 C58 149 54 149 50 147 Z"],
  ["lats", "M77 88 C83 92 90 100 95 106 L99 113 L99 140 C92 148 85 155 80 161 C77 147 74 127 73 108 C73 99 74 93 77 88 Z"],
  ["lowerBack", "M88 149 C92 147 96 145 99 143 L99 184 L88 186 C86 174 86 161 88 149 Z"],
  ["glutes", "M78 191 C86 187 94 187 99 191 L99 222 C92 228 82 228 77 220 C74 210 75 199 78 191 Z"],
  ["hamstrings", "M77 227 C74 245 73 265 76 284 C82 288 90 288 93 282 C96 265 97 245 97 229 C90 231 82 231 77 227 Z"],
  ["calves", "M74 297 C70 313 71 331 76 345 C80 349 84 347 86 341 C88 327 88 311 86 297 C82 295 78 295 74 297 Z"],
]

const MIRROR = "translate(200 0) scale(-1 1)"

function Figure({ title, muscles, intensity, selected, onSelect }) {
  const fillFor = (id) => {
    const v = intensity[id] || 0
    if (!v) return "rgb(var(--line))"
    return `rgb(var(--accent) / ${0.35 + 0.65 * Math.min(1, v)})`
  }
  const part = (side) =>
    muscles.map(([id, d]) => (
      <path
        key={`${side}-${id}`}
        d={d}
        fill={fillFor(id)}
        stroke={selected === id ? "rgb(var(--ink))" : "rgb(var(--surface))"}
        strokeWidth={selected === id ? 1.6 : 1.2}
        className="cursor-pointer transition-[fill] duration-500 hover:brightness-125"
        onClick={() => onSelect(selected === id ? null : id)}
      >
        <title>{MUSCLE_LABEL[id]}</title>
      </path>
    ))
  const silhouette = (
    <>
      <path d={SILHOUETTE.torso} />
      <path d={SILHOUETTE.arm} />
      <path d={SILHOUETTE.leg} />
    </>
  )
  return (
    <figure className="flex min-w-0 flex-1 flex-col items-center">
      <svg viewBox="40 12 120 372" className="h-auto max-h-[250px] w-full" role="img" aria-label={`${title} muscle map`}>
        <g fill="rgb(var(--raised))">
          <ellipse cx="100" cy="32" rx="14" ry="18" />
          <rect x="92" y="44" width="16" height="16" rx="4" />
          {silhouette}
          <g transform={MIRROR}>{silhouette}</g>
        </g>
        {part("l")}
        <g transform={MIRROR}>{part("r")}</g>
      </svg>
      <figcaption className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</figcaption>
    </figure>
  )
}

/** intensity: { muscleId: 0..1 }. Clicking a muscle calls onSelect(id | null). */
export default function BodyMap({ intensity, selected, onSelect }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <Figure title="Front" muscles={FRONT} intensity={intensity} selected={selected} onSelect={onSelect} />
      <Figure title="Back" muscles={BACK} intensity={intensity} selected={selected} onSelect={onSelect} />
    </div>
  )
}
