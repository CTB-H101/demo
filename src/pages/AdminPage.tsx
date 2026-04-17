import { type FormEvent, useState } from 'react'
import { DEFAULT_SYSTEM_CONFIG } from '../constants'
import { createSuggestedMenuFromName, parseMenuText, serializeMenu } from '../lib/menu'
import type { FoodTruck, MenuItem, NewFoodTruckInput, SystemConfig } from '../types'

interface AdminPageProps {
  foodTrucks: FoodTruck[]
  onAddTruck: (input: NewFoodTruckInput) => void
  onUpdateTruck: (truckId: string, inventory: number, crowd: number) => void
  onUpdateTruckMenu: (truckId: string, menu: MenuItem[]) => void
  onDeleteTruck: (truckId: string) => void
  settings: SystemConfig
  onUpdateSettings: (settings: SystemConfig) => void
}

interface FormState {
  name: string
  lat: string
  lng: string
  inventory: string
  crowd: string
  menuText: string
}

const INITIAL_FORM: FormState = {
  name: '',
  lat: '',
  lng: '',
  inventory: '0',
  crowd: '0',
  menuText: '',
}

interface ConfigFormState {
  alpha: string
  beta: string
  gamma: string
  queueTimeMultiplier: string
  decayRate: string
  decayIntervalSec: string
}

function isValidLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function toConfigFormState(settings: SystemConfig): ConfigFormState {
  return {
    alpha: settings.alpha.toString(),
    beta: settings.beta.toString(),
    gamma: settings.gamma.toString(),
    queueTimeMultiplier: settings.queueTimeMultiplier.toString(),
    decayRate: settings.decayRate.toString(),
    decayIntervalSec: (settings.decayIntervalMs / 1000).toString(),
  }
}

export function AdminPage({
  foodTrucks,
  onAddTruck,
  onUpdateTruck,
  onUpdateTruckMenu,
  onDeleteTruck,
  settings,
  onUpdateSettings,
}: AdminPageProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errorMessage, setErrorMessage] = useState('')
  const [menuMessage, setMenuMessage] = useState('')
  const [configMessage, setConfigMessage] = useState('')
  const [configForm, setConfigForm] = useState<ConfigFormState>(() => toConfigFormState(settings))
  const [menuDrafts, setMenuDrafts] = useState<Record<string, string>>({})

  const updateFormValue = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const submitNewTruck = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const lat = Number(form.lat)
    const lng = Number(form.lng)
    const inventory = Number(form.inventory)
    const crowd = Number(form.crowd)

    if (!form.name.trim()) {
      setErrorMessage('Truck name is required.')
      return
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isValidLatLng(lat, lng)) {
      setErrorMessage('Latitude/longitude must be valid coordinates.')
      return
    }

    if (!Number.isInteger(inventory) || inventory < 0) {
      setErrorMessage('Inventory must be a non-negative integer.')
      return
    }

    if (!Number.isFinite(crowd) || crowd < 0) {
      setErrorMessage('Crowd must be a non-negative number.')
      return
    }

    const menu =
      form.menuText.trim().length === 0
        ? createSuggestedMenuFromName(form.name.trim())
        : parseMenuText(form.menuText)

    if (menu === null) {
      setErrorMessage('Menu format must be "Dish Name | Price" per line.')
      return
    }

    onAddTruck({
      name: form.name.trim(),
      lat,
      lng,
      inventory,
      crowd,
      menu,
    })

    setForm(INITIAL_FORM)
    setErrorMessage('')
  }

  const applyUpdate = (truckId: string, inventory: number, crowd: number) => {
    if (!Number.isInteger(inventory) || inventory < 0) {
      setErrorMessage('Inventory must stay a non-negative integer.')
      return
    }

    if (!Number.isFinite(crowd) || crowd < 0) {
      setErrorMessage('Crowd must stay a non-negative number.')
      return
    }

    onUpdateTruck(truckId, inventory, crowd)
    setErrorMessage('')
  }

  const getMenuDraft = (truck: FoodTruck): string => menuDrafts[truck.id] ?? serializeMenu(truck.menu)

  const saveTruckMenu = (truck: FoodTruck) => {
    const draft = getMenuDraft(truck)
    const parsed = parseMenuText(draft)
    if (parsed === null) {
      setMenuMessage(`Invalid menu format for ${truck.name}. Use "Dish Name | Price" per line.`)
      return
    }

    if (parsed.length === 0) {
      setMenuMessage(`Menu cannot be empty for ${truck.name}.`)
      return
    }

    onUpdateTruckMenu(truck.id, parsed)
    setMenuMessage(`Saved menu for ${truck.name}.`)
    setMenuDrafts((previous) => {
      const next = { ...previous }
      delete next[truck.id]
      return next
    })
  }

  const submitSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const alpha = Number(configForm.alpha)
    const beta = Number(configForm.beta)
    const gamma = Number(configForm.gamma)
    const queueTimeMultiplier = Number(configForm.queueTimeMultiplier)
    const decayRate = Number(configForm.decayRate)
    const decayIntervalSec = Number(configForm.decayIntervalSec)

    if (
      !Number.isFinite(alpha) ||
      !Number.isFinite(beta) ||
      !Number.isFinite(gamma) ||
      alpha <= 0 ||
      beta <= 0 ||
      gamma <= 0
    ) {
      setConfigMessage('Alpha, beta, and gamma must be positive numbers (> 0).')
      return
    }

    if (!Number.isFinite(queueTimeMultiplier) || queueTimeMultiplier <= 0) {
      setConfigMessage('Queue time multiplier must be greater than 0.')
      return
    }

    if (!Number.isFinite(decayRate) || decayRate < 0 || decayRate >= 1) {
      setConfigMessage('Decay rate must be within [0, 1).')
      return
    }

    if (!Number.isFinite(decayIntervalSec) || decayIntervalSec < 5) {
      setConfigMessage('Decay interval must be at least 5 seconds.')
      return
    }

    onUpdateSettings({
      alpha,
      beta,
      gamma,
      queueTimeMultiplier,
      decayRate,
      decayIntervalMs: Math.floor(decayIntervalSec * 1000),
    })

    setConfigMessage('System config saved and applied.')
  }

  return (
    <section className="admin-layout">
      <article className="admin-card">
        <h2>System Configuration</h2>
        <form className="admin-form config-form" onSubmit={submitSettings}>
          <label>
            Alpha (distance weight)
            <input
              value={configForm.alpha}
              onChange={(event) => setConfigForm((previous) => ({ ...previous, alpha: event.target.value }))}
            />
          </label>
          <label>
            Beta (queue weight)
            <input
              value={configForm.beta}
              onChange={(event) => setConfigForm((previous) => ({ ...previous, beta: event.target.value }))}
            />
          </label>
          <label>
            Gamma (inventory weight)
            <input
              value={configForm.gamma}
              onChange={(event) => setConfigForm((previous) => ({ ...previous, gamma: event.target.value }))}
            />
          </label>
          <label>
            Queue multiplier (min / crowd)
            <input
              value={configForm.queueTimeMultiplier}
              onChange={(event) =>
                setConfigForm((previous) => ({ ...previous, queueTimeMultiplier: event.target.value }))
              }
            />
          </label>
          <label>
            Decay rate
            <input
              value={configForm.decayRate}
              onChange={(event) => setConfigForm((previous) => ({ ...previous, decayRate: event.target.value }))}
            />
          </label>
          <label>
            Decay interval (seconds)
            <input
              value={configForm.decayIntervalSec}
              onChange={(event) =>
                setConfigForm((previous) => ({ ...previous, decayIntervalSec: event.target.value }))
              }
            />
          </label>
          <div className="button-row">
            <button type="submit">Save config</button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setConfigForm(toConfigFormState(DEFAULT_SYSTEM_CONFIG))
                onUpdateSettings(DEFAULT_SYSTEM_CONFIG)
                setConfigMessage('Reset to default config.')
              }}
            >
              Reset defaults
            </button>
          </div>
        </form>
        {configMessage ? <p className="config-text">{configMessage}</p> : null}
        <p className="config-hint">
          Current: α={settings.alpha.toFixed(2)}, β={settings.beta.toFixed(2)}, γ={settings.gamma.toFixed(2)},
          queue={settings.queueTimeMultiplier.toFixed(2)}, decay={settings.decayRate.toFixed(3)} every{' '}
          {(settings.decayIntervalMs / 1000).toFixed(0)}s
        </p>
      </article>

      <article className="admin-card">
        <h2>Add Food Truck</h2>
        <form className="admin-form" onSubmit={submitNewTruck}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => updateFormValue('name', event.target.value)}
              placeholder="New truck name"
            />
          </label>
          <label>
            Latitude
            <input
              value={form.lat}
              onChange={(event) => updateFormValue('lat', event.target.value)}
              placeholder="42.3744"
            />
          </label>
          <label>
            Longitude
            <input
              value={form.lng}
              onChange={(event) => updateFormValue('lng', event.target.value)}
              placeholder="-71.1169"
            />
          </label>
          <label>
            Inventory
            <input
              value={form.inventory}
              onChange={(event) => updateFormValue('inventory', event.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            Crowd
            <input
              value={form.crowd}
              onChange={(event) => updateFormValue('crowd', event.target.value)}
              placeholder="0"
            />
          </label>
          <label className="menu-input">
            Menu (optional, one item per line: Dish Name | Price)
            <textarea
              value={form.menuText}
              onChange={(event) => updateFormValue('menuText', event.target.value)}
              placeholder={`Classic Burger | 8.50\nFrench Fries | 3.00`}
              rows={4}
            />
          </label>
          <button type="submit">Add truck</button>
        </form>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      </article>

      <article className="admin-card">
        <h2>Manage Existing Trucks</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Inventory</th>
                <th>Crowd</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foodTrucks.map((truck) => (
                <tr key={truck.id}>
                  <td>{truck.name}</td>
                  <td>
                    <input
                      value={String(truck.inventory)}
                      onChange={(event) => {
                        const nextInventory = Number(event.target.value)
                        if (Number.isFinite(nextInventory)) {
                          applyUpdate(truck.id, Math.floor(nextInventory), truck.crowd)
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input
                      value={truck.crowd.toFixed(1)}
                      onChange={(event) => {
                        const nextCrowd = Number(event.target.value)
                        if (Number.isFinite(nextCrowd)) {
                          applyUpdate(truck.id, truck.inventory, nextCrowd)
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="button-row">
                      <button
                        type="button"
                        className="danger"
                        onClick={() => {
                          if (window.confirm(`Delete ${truck.name}?`)) {
                            onDeleteTruck(truck.id)
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="admin-card">
        <h2>Configure Truck Menus</h2>
        <div className="menu-editor-list">
          {foodTrucks.map((truck) => (
            <section className="menu-editor-item" key={truck.id}>
              <h3>{truck.name}</h3>
              <textarea
                value={getMenuDraft(truck)}
                onChange={(event) =>
                  setMenuDrafts((previous) => ({
                    ...previous,
                    [truck.id]: event.target.value,
                  }))
                }
                rows={5}
              />
              <div className="button-row">
                <button type="button" onClick={() => saveTruckMenu(truck)}>
                  Save menu
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    setMenuDrafts((previous) => ({
                      ...previous,
                      [truck.id]: serializeMenu(createSuggestedMenuFromName(truck.name)),
                    }))
                  }
                >
                  Auto-generate by name
                </button>
              </div>
            </section>
          ))}
        </div>
        {menuMessage ? <p className="config-text">{menuMessage}</p> : null}
      </article>
    </section>
  )
}
