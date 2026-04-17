import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { applyCrowdInteraction, applyDecayToTrucks } from './lib/swarm'
import { createSuggestedMenuFromName } from './lib/menu'
import { loadSystemConfig, saveSystemConfig } from './lib/settingsStorage'
import { loadFoodTrucks, saveFoodTrucks } from './lib/storage'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import type { FoodTruck, NewFoodTruckInput, SystemConfig } from './types'

function App() {
  const [settings, setSettings] = useState<SystemConfig>(() => loadSystemConfig())
  const [foodTrucks, setFoodTrucks] = useState<FoodTruck[]>(() =>
    loadFoodTrucks(Date.now(), loadSystemConfig()),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFoodTrucks((previousTrucks) =>
        applyDecayToTrucks(previousTrucks, Date.now(), {
          decayRate: settings.decayRate,
          decayIntervalMs: settings.decayIntervalMs,
        }),
      )
    }, settings.decayIntervalMs)

    return () => window.clearInterval(timer)
  }, [settings.decayIntervalMs, settings.decayRate])

  useEffect(() => {
    saveFoodTrucks(foodTrucks)
  }, [foodTrucks])

  useEffect(() => {
    saveSystemConfig(settings)
  }, [settings])

  const updateTruckById = useCallback(
    (truckId: string, updater: (truck: FoodTruck) => FoodTruck) => {
      setFoodTrucks((previousTrucks) =>
        previousTrucks.map((truck) => {
          if (truck.id !== truckId) {
            return truck
          }
          return updater(truck)
        }),
      )
    },
    [],
  )

  const onJoinQueue = useCallback(
    (truckId: string) => {
      updateTruckById(truckId, (truck) => applyCrowdInteraction(truck, 1, Date.now()))
    },
    [updateTruckById],
  )

  const onLeaveQueue = useCallback(
    (truckId: string) => {
      updateTruckById(truckId, (truck) => applyCrowdInteraction(truck, -1, Date.now()))
    },
    [updateTruckById],
  )

  const onAddTruck = useCallback((input: NewFoodTruckInput) => {
    const menu =
      input.menu && input.menu.length > 0 ? input.menu : createSuggestedMenuFromName(input.name)

    const newTruck: FoodTruck = {
      ...input,
      id: `ft-${Math.random().toString(36).slice(2, 8)}`,
      inventory: Math.floor(input.inventory),
      crowd: input.crowd,
      menu,
      lastUpdated: Date.now(),
    }

    setFoodTrucks((previousTrucks) => [...previousTrucks, newTruck])
  }, [])

  const onUpdateTruck = useCallback((truckId: string, inventory: number, crowd: number) => {
    updateTruckById(truckId, (truck) => ({
      ...truck,
      inventory: Math.max(0, Math.floor(inventory)),
      crowd: Math.max(0, crowd),
      lastUpdated: Date.now(),
    }))
  }, [updateTruckById])

  const onDeleteTruck = useCallback((truckId: string) => {
    setFoodTrucks((previousTrucks) => previousTrucks.filter((truck) => truck.id !== truckId))
  }, [])

  const onUpdateTruckMenu = useCallback(
    (truckId: string, menu: FoodTruck['menu']) => {
      updateTruckById(truckId, (truck) => ({
        ...truck,
        menu,
        lastUpdated: Date.now(),
      }))
    },
    [updateTruckById],
  )

  const onUpdateSettings = useCallback((nextSettings: SystemConfig) => {
    setSettings(nextSettings)
  }, [])

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="top-nav">
          <h1>Campus Food Truck Swarm</h1>
          <nav>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
        </header>

        <main className="page-container">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  foodTrucks={foodTrucks}
                  settings={settings}
                  onJoinQueue={onJoinQueue}
                  onLeaveQueue={onLeaveQueue}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <AdminPage
                  foodTrucks={foodTrucks}
                  onAddTruck={onAddTruck}
                  onUpdateTruck={onUpdateTruck}
                  onUpdateTruckMenu={onUpdateTruckMenu}
                  onDeleteTruck={onDeleteTruck}
                  settings={settings}
                  onUpdateSettings={onUpdateSettings}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
