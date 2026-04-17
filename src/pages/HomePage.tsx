import { useMemo, useState } from 'react'
import { MapView } from '../components/MapView'
import { RecommendationPanel } from '../components/RecommendationPanel'
import { rankFoodTrucks } from '../lib/recommendation'
import { useUserLocation } from '../hooks/useUserLocation'
import type { FoodTruck, SystemConfig } from '../types'

interface HomePageProps {
  foodTrucks: FoodTruck[]
  settings: SystemConfig
  onJoinQueue: (truckId: string) => void
  onLeaveQueue: (truckId: string) => void
}

export function HomePage({ foodTrucks, settings, onJoinQueue, onLeaveQueue }: HomePageProps) {
  const { location, isLocating } = useUserLocation()
  const rankedTrucks = useMemo(
    () => rankFoodTrucks(foodTrucks, location, settings),
    [foodTrucks, location, settings],
  )
  const [selectedTruckId, setSelectedTruckId] = useState<string | undefined>(undefined)
  const effectiveSelectedTruckId = useMemo(() => {
    if (rankedTrucks.length === 0) {
      return undefined
    }

    if (selectedTruckId && rankedTrucks.some((truck) => truck.id === selectedTruckId)) {
      return selectedTruckId
    }

    return rankedTrucks[0].id
  }, [rankedTrucks, selectedTruckId])

  return (
    <div className="home-layout">
      <MapView
        foodTrucks={foodTrucks}
        userLocation={location}
        selectedTruckId={effectiveSelectedTruckId}
        recommendedTruckId={rankedTrucks[0]?.id}
        settings={settings}
        onSelectTruck={setSelectedTruckId}
        onJoinQueue={onJoinQueue}
        onLeaveQueue={onLeaveQueue}
      />
      <RecommendationPanel
        rankedTrucks={rankedTrucks}
        selectedTruckId={effectiveSelectedTruckId}
        userLocation={location}
        isLocating={isLocating}
        settings={settings}
        onSelectTruck={setSelectedTruckId}
        onJoinQueue={onJoinQueue}
        onLeaveQueue={onLeaveQueue}
      />
    </div>
  )
}
