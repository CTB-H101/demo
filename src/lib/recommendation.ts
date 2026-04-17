import { DEFAULT_SYSTEM_CONFIG, DEFAULT_WEIGHTS } from '../constants'
import { queueTimeMin } from './swarm'
import type { FoodTruck, RankedTruck, RankingWeights, SystemConfig, UserLocation } from '../types'

const EARTH_RADIUS_KM = 6371

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

export function haversineKm(from: Pick<UserLocation, 'lat' | 'lng'>, to: Pick<FoodTruck, 'lat' | 'lng'>): number {
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

export function computeScore(
  truck: FoodTruck,
  userLocation: UserLocation,
  weightsOrConfig: RankingWeights | SystemConfig = DEFAULT_WEIGHTS,
): RankedTruck {
  const weights = {
    alpha: weightsOrConfig.alpha,
    beta: weightsOrConfig.beta,
    gamma: weightsOrConfig.gamma,
  }
  const queueMultiplier =
    'queueTimeMultiplier' in weightsOrConfig
      ? weightsOrConfig.queueTimeMultiplier
      : DEFAULT_SYSTEM_CONFIG.queueTimeMultiplier

  const distanceKm = haversineKm(userLocation, truck)
  const estimatedQueueTime = queueTimeMin(truck.crowd, queueMultiplier)
  const score =
    weights.alpha * distanceKm +
    weights.beta * estimatedQueueTime -
    weights.gamma * truck.inventory

  return {
    ...truck,
    distanceKm,
    queueTimeMin: estimatedQueueTime,
    score,
  }
}

export function rankFoodTrucks(
  trucks: FoodTruck[],
  userLocation: UserLocation,
  weightsOrConfig: RankingWeights | SystemConfig = DEFAULT_WEIGHTS,
): RankedTruck[] {
  return trucks
    .map((truck) => computeScore(truck, userLocation, weightsOrConfig))
    .sort((left, right) => {
      if (left.score === right.score) {
        return left.id.localeCompare(right.id)
      }
      return left.score - right.score
    })
}
