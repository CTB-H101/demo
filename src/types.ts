export interface MenuItem {
  id: string
  name: string
  price: number
}

export interface FoodTruck {
  id: string
  name: string
  lat: number
  lng: number
  inventory: number
  crowd: number
  menu: MenuItem[]
  lastUpdated: number
}

export interface NewFoodTruckInput {
  name: string
  lat: number
  lng: number
  inventory: number
  crowd: number
  menu?: MenuItem[]
}

export interface UserLocation {
  lat: number
  lng: number
  source: 'gps' | 'fallback'
}

export interface RankingWeights {
  alpha: number
  beta: number
  gamma: number
}

export interface SystemConfig extends RankingWeights {
  queueTimeMultiplier: number
  decayRate: number
  decayIntervalMs: number
}

export interface RankedTruck extends FoodTruck {
  distanceKm: number
  queueTimeMin: number
  score: number
}
