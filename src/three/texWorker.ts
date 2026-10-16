import { concrete_, plywood_, turf_, woodBoard_, type RawPbr } from './texGen'

type Job = { k: string; kind: 'w' | 'c' | 'p' | 't'; seed?: number; tone?: number }
const run = (j: Job): RawPbr => j.kind === 'w' ? woodBoard_(j.seed!, j.tone!) : j.kind === 'c' ? concrete_() : j.kind === 'p' ? plywood_() : turf_()

self.onmessage = (e: MessageEvent<Job>) => {
  const p = run(e.data)
  ;(self as unknown as Worker).postMessage({ k: e.data.k, p }, [p.map.data.buffer, p.bump.data.buffer])
}
