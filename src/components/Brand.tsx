type P = { size?: number }
const solid = (size = 18) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const })
const line = (size = 18) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const })

export const Facebook = ({ size }: P) => (<svg {...solid(size)}><path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.9s-1.3-.2-2.5-.2c-2.6 0-4.2 1.5-4.2 4.3v2.5H7.5v3.3h3.1V22z" /></svg>)
export const Youtube = ({ size }: P) => (<svg {...solid(size)}><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" /></svg>)
export const Instagram = ({ size }: P) => (<svg {...line(size)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".7" fill="currentColor" stroke="none" /></svg>)
export const Linkedin = ({ size }: P) => (<svg {...solid(size)}><path d="M6.9 8.8H3.6V20h3.3zM5.3 3.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM20.4 13.5c0-3-1.6-4.9-4.2-4.9-1.4 0-2.4.8-2.8 1.5V8.8h-3.2V20h3.3v-6.2c0-1.6.3-3 2.2-3s2 1.8 2 3.1V20h3.3z" /></svg>)
