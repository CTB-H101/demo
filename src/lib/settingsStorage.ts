import { DEFAULT_SYSTEM_CONFIG, SETTINGS_STORAGE_KEY } from '../constants'
import type { SystemConfig } from '../types'

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidConfig(value: unknown): value is SystemConfig {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    isFiniteNumber(candidate.alpha) &&
    candidate.alpha > 0 &&
    isFiniteNumber(candidate.beta) &&
    candidate.beta > 0 &&
    isFiniteNumber(candidate.gamma) &&
    candidate.gamma > 0 &&
    isFiniteNumber(candidate.queueTimeMultiplier) &&
    candidate.queueTimeMultiplier > 0 &&
    isFiniteNumber(candidate.decayRate) &&
    candidate.decayRate >= 0 &&
    candidate.decayRate < 1 &&
    isFiniteNumber(candidate.decayIntervalMs) &&
    candidate.decayIntervalMs >= 5000
  )
}

export function saveSystemConfig(config: SystemConfig): void {
  if (!hasStorage()) {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

export function loadSystemConfig(): SystemConfig {
  if (!hasStorage()) {
    return DEFAULT_SYSTEM_CONFIG
  }

  const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!raw) {
    saveSystemConfig(DEFAULT_SYSTEM_CONFIG)
    return DEFAULT_SYSTEM_CONFIG
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isValidConfig(parsed)) {
      throw new Error('Invalid settings payload')
    }
    return parsed
  } catch {
    saveSystemConfig(DEFAULT_SYSTEM_CONFIG)
    return DEFAULT_SYSTEM_CONFIG
  }
}
