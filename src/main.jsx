import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource-variable/manrope"
import "./index.css"
import App from "./App.jsx"
import { seedDemo } from "./lib/demo"

if (import.meta.env.DEV) seedDemo()

// index.html?view=tab opens the same app as a full browser tab.
const isFull = new URLSearchParams(location.search).get("view") === "tab"
document.documentElement.classList.toggle("full", isFull)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App isFull={isFull} />
  </StrictMode>,
)
