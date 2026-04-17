import type { FoodTruck, RankingWeights, SystemConfig } from './types'
import { createSuggestedMenuFromName } from './lib/menu'

export const STORAGE_KEY = 'ctb_food_trucks_v1'
export const SETTINGS_STORAGE_KEY = 'ctb_settings_v1'

export const CAMPUS_CENTER = {
  lat: 42.3744,
  lng: -71.1169,
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  alpha: 1.0,
  beta: 1.35,
  gamma: 0.85,
}

export const QUEUE_TIME_MULTIPLIER = 2.5
export const DECAY_RATE = 0.06
export const DECAY_INTERVAL_MS = 30_000
export const LOCATION_TIMEOUT_MS = 8_000
export const MAP_ZOOM = 16

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  alpha: DEFAULT_WEIGHTS.alpha,
  beta: DEFAULT_WEIGHTS.beta,
  gamma: DEFAULT_WEIGHTS.gamma,
  queueTimeMultiplier: QUEUE_TIME_MULTIPLIER,
  decayRate: DECAY_RATE,
  decayIntervalMs: DECAY_INTERVAL_MS,
}

const INITIAL_FOOD_TRUCK_TEMPLATE = [
  {
    id: 'ft1',
    name: 'Harvard Burger Truck',
    lat: 42.37442,
    lng: -71.11695,
    inventory: 9,
    crowd: 4,
  },
  {
    id: 'ft2',
    name: 'Cambridge Taco Express',
    lat: 42.37255,
    lng: -71.1188,
    inventory: 6,
    crowd: 7,
  },
  {
    id: 'ft3',
    name: 'Redwood Sushi Cart',
    lat: 42.3761,
    lng: -71.1142,
    inventory: 10,
    crowd: 2,
  },
  {
    id: 'ft4',
    name: 'Boston Fried Chicken Spot',
    lat: 42.3733,
    lng: -71.1129,
    inventory: 5,
    crowd: 5,
  },
] as const

export function createInitialFoodTrucks(now = Date.now()): FoodTruck[] {
  return INITIAL_FOOD_TRUCK_TEMPLATE.map((truck) => ({
    ...truck,
    menu: createSuggestedMenuFromName(truck.name),
    lastUpdated: now,
  }))
}
