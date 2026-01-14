import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </ThemeProvider>
)
