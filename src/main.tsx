import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LangProvider } from './i18n'
import './styles.css'
import { startPerf } from './lib/perf'
import { applyConsent } from './lib/consent'

// Render immediately once the critical stylesheet is available. Keeping the CSS
// request render-blocking avoids a blank first paint while the app waits for a
// custom event on slower connections.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider><App /></LangProvider>
  </StrictMode>,
)
startPerf()
applyConsent()
