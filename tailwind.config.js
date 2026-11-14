/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: v("bg"),
        surface: v("surface"),
        raised: v("raised"),
        line: v("line"),
        ink: v("ink"),
        muted: v("muted"),
        accent: v("accent"),
        habit: v("habit"),
        water: v("water"),
        lift: v("lift"),
        danger: v("danger"),
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "Manrope", "system-ui", "sans-serif"],
      },
      animation: {
        pulsate: "pulsate 0.5s ease-in-out",
        fadeIn: "fadeIn 0.2s ease-out both",
        pop: "pop 0.25s ease-out",
      },
      keyframes: {
        pulsate: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(-6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        wave: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)" },
          "60%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
}
