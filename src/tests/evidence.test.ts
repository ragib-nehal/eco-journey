import { describe, expect, it } from 'vitest'
import { EVIDENCE, getEvidence, SOURCES, sourcesFor } from '../game/evidence.ts'
import { SCENARIOS } from '../game/scenarios.ts'

const MAX_FACT_LENGTH = 180
const optionIds = Object.values(SCENARIOS).flatMap((s) => s.options.map((o) => o.id))

describe('decision evidence data (docs/research/decision-evidence.json)', () => {
  it('only uses real option ids', () => {
    const unknown = Object.keys(EVIDENCE).filter((id) => !optionIds.includes(id))
    expect(unknown, 'evidence keys that match no option in scenarios.ts').toEqual([])
  })

  it('gives every fact a known source, a valid status and a short length', () => {
    for (const [optionId, evidence] of Object.entries(EVIDENCE)) {
      expect(SOURCES[evidence.sourceId], `${optionId}: unknown sourceId "${evidence.sourceId}"`).toBeDefined()
      expect(['draft', 'reviewed'], `${optionId}: status`).toContain(evidence.status)
      expect(evidence.fact.trim(), `${optionId}: empty fact`).not.toBe('')
      expect(evidence.fact.length, `${optionId}: fact longer than ${MAX_FACT_LENGTH}`).toBeLessThanOrEqual(
        MAX_FACT_LENGTH,
      )
    }
  })

  it('has complete sources with https links', () => {
    for (const [id, source] of Object.entries(SOURCES)) {
      expect(source.url, `${id}: url`).toMatch(/^https:\/\/\S+$/)
      expect(source.publisher.trim(), `${id}: publisher`).not.toBe('')
      expect(source.title.trim(), `${id}: title`).not.toBe('')
      expect(Number.isInteger(source.year) && source.year >= 1950 && source.year <= 2100, `${id}: year`).toBe(true)
      expect(source.accessed, `${id}: accessed`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('has no unused sources', () => {
    const used = new Set(Object.values(EVIDENCE).map((e) => e.sourceId))
    const unused = Object.keys(SOURCES).filter((id) => !used.has(id))
    expect(unused, 'sources not cited by any fact').toEqual([])
  })

  it('reports coverage', () => {
    const covered = optionIds.filter((id) => getEvidence(id)).length
    console.info(`Decision evidence coverage: ${covered} / ${optionIds.length} options have a fact`)
    expect(covered).toBeGreaterThan(0)
  })
})

describe('sourcesFor', () => {
  it('lists each cited source once, in first-cited order, and skips options without evidence', () => {
    const ids = Object.keys(EVIDENCE)
    const withoutEvidence = optionIds.find((id) => !getEvidence(id))
    const list = sourcesFor([...ids, ...ids, ...(withoutEvidence ? [withoutEvidence] : [])])
    const expected = [...new Set(ids.map((id) => EVIDENCE[id].sourceId))]
    expect(list.map((s) => s.id)).toEqual(expected)
  })

  it('returns nothing when no choice has evidence', () => {
    expect(sourcesFor([])).toEqual([])
  })
})
