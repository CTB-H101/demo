import type { RankedTruck, SystemConfig, UserLocation } from '../types'

interface RecommendationPanelProps {
  rankedTrucks: RankedTruck[]
  selectedTruckId?: string
  userLocation: UserLocation
  isLocating: boolean
  settings: SystemConfig
  onSelectTruck: (truckId: string) => void
  onJoinQueue: (truckId: string) => void
  onLeaveQueue: (truckId: string) => void
}

function formatDistance(km: number): string {
  return `${km.toFixed(2)} km`
}

export function RecommendationPanel({
  rankedTrucks,
  selectedTruckId,
  userLocation,
  isLocating,
  settings,
  onSelectTruck,
  onJoinQueue,
  onLeaveQueue,
}: RecommendationPanelProps) {
  const topOne = rankedTrucks[0]
  const topThree = rankedTrucks.slice(0, 3)
  const selected = rankedTrucks.find((truck) => truck.id === selectedTruckId) ?? topOne

  return (
    <aside className="panel-card">
      <header className="panel-header">
        <h2>Swarm Recommendation</h2>
        <p data-testid="location-source">
          Location source: {isLocating ? 'locating...' : userLocation.source}
        </p>
        <p data-testid="truck-count">Active trucks: {rankedTrucks.length}</p>
      </header>

      {topOne ? (
        <article className="best-card">
          <p className="label">Top recommendation</p>
          <h3 data-testid="top-recommendation-name">{topOne.name}</h3>
          <p>Score: {topOne.score.toFixed(2)}</p>
          <p>Wait: {topOne.queueTimeMin.toFixed(1)} min</p>
          <p>Distance: {formatDistance(topOne.distanceKm)}</p>
        </article>
      ) : (
        <p className="empty-state">No food trucks available. Add one from the admin page.</p>
      )}

      <section className="ranking-section">
        <h3>Top 3 list</h3>
        <ol className="ranking-list">
          {topThree.map((truck) => (
            <li
              key={truck.id}
              className={truck.id === topOne?.id ? 'rank-item rank-item-top' : 'rank-item'}
              data-testid={`rank-item-${truck.id}`}
            >
              <button
                type="button"
                className="truck-focus"
                data-testid={`focus-button-${truck.id}`}
                onClick={() => onSelectTruck(truck.id)}
              >
                <span>{truck.name}</span>
                <span>{truck.score.toFixed(2)}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {selected ? (
        <section className="selected-details">
          <h3>Selected truck</h3>
          <p>{selected.name}</p>
          <p>Inventory: {selected.inventory}</p>
          <p data-testid={`crowd-value-${selected.id}`}>Crowd level: {selected.crowd.toFixed(1)}</p>
          <p>Estimated wait: {selected.queueTimeMin.toFixed(1)} min</p>
          <p>Distance: {formatDistance(selected.distanceKm)}</p>
          <div className="menu-note">
            <p>Current score: {selected.score.toFixed(2)}</p>
            <p>Status: {selected.id === topOne?.id ? 'Top recommendation' : 'Alternative option'}</p>
            <p>
              Weights: α {settings.alpha.toFixed(2)} / β {settings.beta.toFixed(2)} / γ{' '}
              {settings.gamma.toFixed(2)}
            </p>
          </div>
          <div className="dish-menu-block">
            <h4>Dish menu</h4>
            <ul>
              {selected.menu.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="button-row">
            <button
              type="button"
              data-testid={`join-button-${selected.id}`}
              onClick={() => onJoinQueue(selected.id)}
            >
              I&apos;m waiting here
            </button>
            <button
              type="button"
              className="ghost"
              data-testid={`leave-button-${selected.id}`}
              onClick={() => onLeaveQueue(selected.id)}
            >
              Leave queue
            </button>
          </div>
        </section>
      ) : null}
    </aside>
  )
}
