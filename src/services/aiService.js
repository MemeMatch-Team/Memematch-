import { analyzeFallback, validateAnalysis } from './matchingService.js'
// Returns { analysis, usedAI }. Never throws: falls back to keyword analysis.
export async function analyze(text) {
  try {
    const r = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) })
    if (r.ok) {
      const a = validateAnalysis(await r.json())
      if (a) return { analysis: a, usedAI: true }
    }
  } catch { /* network/API down */ }
  return { analysis: analyzeFallback(text), usedAI: false }
}
