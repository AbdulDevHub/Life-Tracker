/** Life Tracker mark: a pulse line ending in a check, one segment per tab colour. Master: public/icons/logo.svg */
export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
      <rect width="128" height="128" rx="30" fill="#16161b" />
      <g fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 70 H38 L49 46" stroke="#9d78fa" />
        <path d="M49 46 L62 88 L75 58" stroke="#1cabe3" />
        <path d="M75 58 L85 76 L110 38" stroke="#f98028" />
      </g>
    </svg>
  )
}
