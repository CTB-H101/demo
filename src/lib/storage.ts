import { STORAGE_KEY, createInitialFoodTrucks } from '../constants'
import { createSuggestedMenuFromName } from './menu'
import { applyDecayToTrucks } from './swarm'
import type { FoodTruck, MenuItem, SystemConfig } from '../types'

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isValidMenuItem(value: unknown): value is MenuItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number' &&
    Number.isFinite(candidate.price) &&
    candidate.price >= 0
  )
}

function toFoodTruck(value: unknown): FoodTruck | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as Record<string, unknown>

  const menuFromStorage =
    Array.isArray(candidate.menu) && candidate.menu.every(isValidMenuItem)
      ? candidate.menu
      : createSuggestedMenuFromName(String(candidate.name ?? 'Food Truck'))

  if (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.lat === 'number' &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lng === 'number' &&
    Number.isFinite(candidate.lng) &&
    typeof candidate.inventory === 'number' &&
    Number.isFinite(candidate.inventory) &&
    candidate.inventory >= 0 &&
    typeof candidate.crowd === 'number' &&
    Number.isFinite(candidate.crowd) &&
    candidate.crowd >= 0 &&
    typeof candidate.lastUpdated === 'number' &&
    Number.isFinite(candidate.lastUpdated)
  ) {
    return {
      id: candidate.id,
      name: candidate.name,
      lat: candidate.lat,
      lng: candidate.lng,
      inventory: candidate.inventory,
      crowd: candidate.crowd,
      menu: menuFromStorage,
      lastUpdated: candidate.lastUpdated,
    }
  }

  return null
}

export function saveFoodTrucks(trucks: FoodTruck[]): void {
  if (!hasStorage()) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trucks))
  } catch {
    // Ignore write failures to keep UI responsive in private/incognito contexts.
  }
}

export function loadFoodTrucks(
  now = Date.now(),
  config?: Pick<SystemConfig, 'decayRate' | 'decayIntervalMs'>,
): FoodTruck[] {
  const fallback = createInitialFoodTrucks(now)

  if (!hasStorage()) {
    return fallback
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    saveFoodTrucks(fallback)
    return fallback
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid food truck payload')
    }

    const migrated = parsed.map((entry) => toFoodTruck(entry)).filter((entry) => entry !== null)
    if (migrated.length === 0) {
      throw new Error('No valid food trucks found')
    }

    const decayed = applyDecayToTrucks(migrated, now, config)
    saveFoodTrucks(decayed)
    return decayed
  } catch {
    saveFoodTrucks(fallback)
    return fallback
  }
}
