import type { CSSProperties } from 'react'

type BackgroundCubesGridProps = { className?: string }

/** CSS-native adaptation of Aceternity's cube-grid background for this non-Tailwind app. */
export default function BackgroundCubesGrid({ className = '' }: BackgroundCubesGridProps) {
  return (
    <div className={`cubes-grid ${className}`} aria-hidden="true">
      {Array.from({ length: 144 }, (_, index) => {
        const delay = (index * 0.17) % 5
        const duration = 4.5 + (index % 7) * 0.55
        return <i key={index} style={{ '--delay': `${delay}s`, '--duration': `${duration}s` } as CSSProperties} />
      })}
    </div>
  )
}
