import { useEffect, useState } from 'react'

/** Keeps WebGL components in sync with the document theme. */
export function useLightTheme() {
  const [light, setLight] = useState(() => document.documentElement.dataset.theme !== 'dark')
  useEffect(() => {
    const root = document.documentElement
    const update = () => setLight(root.dataset.theme !== 'dark')
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    update()
    return () => observer.disconnect()
  }, [])
  return light
}
