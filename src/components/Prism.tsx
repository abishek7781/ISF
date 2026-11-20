import type { CSSProperties } from 'react'

type PrismProps = { className?: string; lightMode?: boolean; style?: CSSProperties }

/** Lightweight, dependency-free prism light for hero backgrounds. */
export default function Prism({ className = '', lightMode = false, style }: PrismProps) {
  return <div className={`prism-bg ${lightMode ? 'prism-light' : ''} ${className}`} style={style} aria-hidden="true">
    <span className="prism-beam prism-beam-a" /><span className="prism-beam prism-beam-b" /><span className="prism-core" />
  </div>
}
