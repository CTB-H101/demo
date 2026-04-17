import { describe, expect, it } from 'vitest'
import { DECAY_INTERVAL_MS } from '../constants'
import { createSuggestedMenuFromName } from './menu'
import {
  applyCrowdInteraction,
  applyDecay,
  applyDecayToTruck,
  applyDecayToTrucks,
  updateCrowd,
} from './swarm'
import type { FoodTruck } from '../types'

function truck(overrides: Partial<FoodTruck>): FoodTruck {
  return {
    id: 'ft-test',
    name: 'Test truck',
    lat: 42.3744,
    lng: -71.1169,
    inventory: 5,
    crowd: 10,
    menu: createSuggestedMenuFromName('Test truck'),
    lastUpdated: 0,
    ...overrides,
  }
}

describe('swarm behavior', () => {
  it('does not allow crowd below zero', () => {
    expect(updateCrowd(0.5, -5)).toBe(0)
  })

  it('applies crowd decay by interval count', () => {
    expect(applyDecay(10, 2)).toBeCloseTo(8.836, 3)
  })

  it('decays a truck based on elapsed time', () => {
    const now = DECAY_INTERVAL_MS * 2 + 500
    const decayed = applyDecayToTruck(truck({ crowd: 10 }), now)

    expect(decayed.crowd).toBeCloseTo(8.836, 3)
    expect(decayed.lastUpdated).toBe(DECAY_INTERVAL_MS * 2)
  })

  it('updates crowd interaction timestamp', () => {
    const interacted = applyCrowdInteraction(truck({ crowd: 3 }), 1, 5000)
    expect(interacted.crowd).toBe(4)
    expect(interacted.lastUpdated).toBe(5000)
  })

  it('decays all trucks in the list', () => {
    const now = DECAY_INTERVAL_MS * 3
    const decayed = applyDecayToTrucks([truck({ id: 'a' }), truck({ id: 'b', crowd: 2 })], now)
    expect(decayed[0].crowd).toBeCloseTo(8.306, 3)
    expect(decayed[1].crowd).toBeCloseTo(1.661, 3)
  })
})
