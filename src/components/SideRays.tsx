import type { CSSProperties } from 'react'

type SideRaysProps = { className?: string; lightMode?: boolean; style?: CSSProperties }

export default function SideRays({ className = '', lightMode = false, style }: SideRaysProps) {
  return <div className={`side-rays ${lightMode ? 'side-rays-light' : ''} ${className}`} style={style} aria-hidden="true">
    <i /><i /><i /><i /><i /><b />
  </div>
}
