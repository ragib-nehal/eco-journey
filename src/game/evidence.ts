// Researched facts and sources for decision feedback.
//
// The data lives in docs/research/decision-evidence.json so the research team
// can edit it without touching game code; see docs/research/README.md.
// Evidence is keyed by option id. Options without an entry show only the
// authored "Why it matters" line.
import data from '../../docs/research/decision-evidence.json'
import type { Evidence, Source } from './types.ts'

export const SOURCES: Record<string, Source> = data.sources
export const EVIDENCE: Record<string, Evidence> = data.evidence as Record<string, Evidence>

export function getEvidence(optionId: string): Evidence | undefined {
  return EVIDENCE[optionId]
}

export function getSource(sourceId: string): Source | undefined {
  return SOURCES[sourceId]
}

/** Unique sources cited by the given options, in first-cited order. */
export function sourcesFor(optionIds: string[]): (Source & { id: string })[] {
  const ids = new Set<string>()
  for (const optionId of optionIds) {
    const evidence = getEvidence(optionId)
    if (evidence && getSource(evidence.sourceId)) ids.add(evidence.sourceId)
  }
  return [...ids].map((id) => ({ id, ...SOURCES[id] }))
}
