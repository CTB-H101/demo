import { DECAY_INTERVAL_MS, DECAY_RATE, QUEUE_TIME_MULTIPLIER } from '../constants'
import type { FoodTruck, SystemConfig } from '../types'

function roundTo(value: number, precision = 3): number {
  return Number(value.toFixed(precision))
}

export function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value
}

export function queueTimeMin(crowd: number, queueMultiplier = QUEUE_TIME_MULTIPLIER): number {
  return clampNonNegative(crowd) * queueMultiplier
}

export function updateCrowd(crowd: number, delta: number): number {
  return clampNonNegative(crowd + delta)
}

export function applyDecay(crowd: number, intervals = 1, decayRate = DECAY_RATE): number {
  if (intervals <= 0) {
    return clampNonNegative(crowd)
  }

  const nextCrowd = clampNonNegative(crowd) * Math.pow(1 - decayRate, intervals)
  return roundTo(nextCrowd)
}

export function applyDecayToTruck(
  truck: FoodTruck,
  now: number,
  decayRate = DECAY_RATE,
  decayIntervalMs = DECAY_INTERVAL_MS,
): FoodTruck {
  const elapsed = now - truck.lastUpdated
  if (elapsed < decayIntervalMs) {
    return truck
  }

  const intervals = Math.floor(elapsed / decayIntervalMs)
  return {
    ...truck,
    crowd: applyDecay(truck.crowd, intervals, decayRate),
    lastUpdated: truck.lastUpdated + intervals * decayIntervalMs,
  }
}

export function applyDecayToTrucks(
  trucks: FoodTruck[],
  now: number,
  config?: Pick<SystemConfig, 'decayRate' | 'decayIntervalMs'>,
): FoodTruck[] {
  const decayRate = config?.decayRate ?? DECAY_RATE
  const decayIntervalMs = config?.decayIntervalMs ?? DECAY_INTERVAL_MS
  return trucks.map((truck) => applyDecayToTruck(truck, now, decayRate, decayIntervalMs))
}

export function applyCrowdInteraction(truck: FoodTruck, delta: number, now: number): FoodTruck {
  return {
    ...truck,
    crowd: updateCrowd(truck.crowd, delta),
    lastUpdated: now,
  }
}
