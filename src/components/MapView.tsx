import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { MAP_ZOOM, OSM_ATTRIBUTION, OSM_TILE_URL } from '../constants'
import { queueTimeMin } from '../lib/swarm'
import type { FoodTruck, SystemConfig, UserLocation } from '../types'

interface MapViewProps {
  foodTrucks: FoodTruck[]
  userLocation: UserLocation
  selectedTruckId?: string
  recommendedTruckId?: string
  settings: SystemConfig
  onSelectTruck: (truckId: string) => void
  onJoinQueue: (truckId: string) => void
  onLeaveQueue: (truckId: string) => void
}

function RecenterMap({ userLocation }: { userLocation: UserLocation }) {
  const map = useMap()

  map.setView([userLocation.lat, userLocation.lng], MAP_ZOOM)
  return null
}

export function MapView({
  foodTrucks,
  userLocation,
  selectedTruckId,
  recommendedTruckId,
  settings,
  onSelectTruck,
  onJoinQueue,
  onLeaveQueue,
}: MapViewProps) {
  return (
    <section className="map-card">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={MAP_ZOOM}
        scrollWheelZoom
        className="leaflet-map"
      >
        <RecenterMap userLocation={userLocation} />

        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />

        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{ color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.95 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>

        {foodTrucks.map((truck) => {
          const isRecommended = truck.id === recommendedTruckId
          const isSelected = truck.id === selectedTruckId
          const waitTime = queueTimeMin(truck.crowd, settings.queueTimeMultiplier).toFixed(1)

          return (
            <CircleMarker
              key={truck.id}
              center={[truck.lat, truck.lng]}
              radius={isRecommended ? 12 : isSelected ? 11 : 9}
              pathOptions={{
                color: isRecommended ? '#d97706' : '#0f766e',
                fillColor: isRecommended ? '#f59e0b' : '#14b8a6',
                fillOpacity: isSelected ? 0.95 : 0.8,
              }}
              eventHandlers={{
                click: () => onSelectTruck(truck.id),
              }}
            >
              <Popup>
                <article className="popup-card">
                  <h3>{truck.name}</h3>
                  <p>Inventory: {truck.inventory}</p>
                  <p>Crowd level: {truck.crowd.toFixed(1)}</p>
                  <p>Estimated wait: {waitTime} min</p>
                  <p>Menu: {truck.menu.slice(0, 2).map((item) => item.name).join(', ')}</p>
                  <div className="button-row">
                    <button type="button" onClick={() => onJoinQueue(truck.id)}>
                      I&apos;m waiting here
                    </button>
                    <button type="button" className="ghost" onClick={() => onLeaveQueue(truck.id)}>
                      Leave queue
                    </button>
                  </div>
                </article>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </section>
  )
}
