import { describe, expect, it } from 'vitest'
import { computeScore, haversineKm, rankFoodTrucks } from './recommendation'
import { createSuggestedMenuFromName } from './menu'
import type { FoodTruck, UserLocation } from '../types'

const user: UserLocation = {
  lat: 42.3744,
  lng: -71.1169,
  source: 'fallback',
}

function truck(overrides: Partial<FoodTruck>): FoodTruck {
  return {
    id: 'ft-x',
    name: 'Truck',
    lat: 42.3744,
    lng: -71.1169,
    inventory: 5,
    crowd: 2,
    menu: createSuggestedMenuFromName('Truck'),
    lastUpdated: 0,
    ...overrides,
  }
}

describe('recommendation math', () => {
  it('returns zero distance for identical coordinates', () => {
    const distance = haversineKm(user, truck({}))
    expect(distance).toBeCloseTo(0, 6)
  })

  it('computes scores using distance, crowd, and inventory', () => {
    const ranked = computeScore(truck({ inventory: 10, crowd: 4 }), user)
    expect(ranked.queueTimeMin).toBe(10)
    expect(ranked.score).toBeCloseTo(5.0)
  })

  it('ranks by score, then by id when tied', () => {
    const tiedA = truck({ id: 'a', name: 'A' })
    const tiedB = truck({ id: 'b', name: 'B' })
    const farther = truck({ id: 'c', name: 'C', lat: 42.3844, lng: -71.1069 })

    const ranked = rankFoodTrucks([farther, tiedB, tiedA], user)
    expect(ranked.map((entry) => entry.id)).toEqual(['a', 'b', 'c'])
  })

  it('supports custom queue multiplier through system config', () => {
    const ranked = computeScore(
      truck({ inventory: 10, crowd: 4 }),
      user,
      {
        alpha: 1,
        beta: 1.35,
        gamma: 0.85,
        queueTimeMultiplier: 3,
        decayRate: 0.06,
        decayIntervalMs: 30_000,
      },
    )
    expect(ranked.queueTimeMin).toBe(12)
    expect(ranked.score).toBeCloseTo(7.7)
  })
})
