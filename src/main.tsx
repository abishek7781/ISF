import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LangProvider } from './i18n'
import './styles.css'
import { startPerf } from './lib/perf'
import { applyConsent } from './lib/consent'

// The stylesheet loads without blocking the first paint, so wait for it (at most 3 seconds) before the app draws.
const cssReady = () => {
  const loading = document.querySelector('link[rel=stylesheet][media=print]')
  if (!loading || (window as unknown as { __css?: number }).__css) return Promise.resolve()
  return new Promise<void>((res) => { addEventListener('isf-css', () => res(), { once: true }); setTimeout(res, 3000) })
}

void cssReady().then(() => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider><App /></LangProvider>
  </StrictMode>,
))
startPerf()
applyConsent()
