import { beforeEach, describe, expect, it } from 'vitest'
import { DECAY_INTERVAL_MS, STORAGE_KEY, createInitialFoodTrucks } from '../constants'
import { loadFoodTrucks, saveFoodTrucks } from './storage'

describe('food truck storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('loads hardcoded trucks when storage is empty', () => {
    const loaded = loadFoodTrucks(1000)
    expect(loaded).toHaveLength(4)
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('persists and reads local storage values', () => {
    const initial = createInitialFoodTrucks(0)
    saveFoodTrucks(initial)

    const loaded = loadFoodTrucks(10)
    expect(loaded[0].name).toBe('Harvard Burger Truck')
  })

  it('applies compensation decay while loading saved trucks', () => {
    const seeded = createInitialFoodTrucks(0)
    seeded[0].crowd = 10
    seeded[0].lastUpdated = 0
    saveFoodTrucks(seeded)

    const loaded = loadFoodTrucks(DECAY_INTERVAL_MS * 2 + 100)
    expect(loaded[0].crowd).toBeCloseTo(8.836, 3)
  })

  it('recovers from malformed storage payload', () => {
    window.localStorage.setItem(STORAGE_KEY, '{"bad": true}')
    const loaded = loadFoodTrucks(2000)
    expect(loaded).toHaveLength(4)
    expect(loaded[0].name).toBe('Harvard Burger Truck')
  })
})
