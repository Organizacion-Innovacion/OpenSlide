import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useSettingsStore } from './store/useSettingsStore'
import './index.css'

function ThemeProvider({ children }) {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
