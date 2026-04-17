import type { MenuItem } from '../types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function createMenuItem(name: string, price: number): MenuItem {
  return {
    id: `menu-${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    price,
  }
}

export function createSuggestedMenuFromName(truckName: string): MenuItem[] {
  const lowerName = truckName.toLowerCase()

  if (lowerName.includes('burger')) {
    return [
      createMenuItem('Classic Cheeseburger', 8.5),
      createMenuItem('Bacon BBQ Burger', 9.75),
      createMenuItem('Crispy Fries', 3.5),
    ]
  }

  if (lowerName.includes('taco')) {
    return [
      createMenuItem('Carne Asada Taco', 4.5),
      createMenuItem('Chicken Taco', 4.25),
      createMenuItem('Street Corn Cup', 3.75),
    ]
  }

  if (lowerName.includes('sushi')) {
    return [
      createMenuItem('Salmon Nigiri Set', 10.5),
      createMenuItem('California Roll', 8.0),
      createMenuItem('Miso Soup', 2.75),
    ]
  }

  if (lowerName.includes('chicken')) {
    return [
      createMenuItem('Fried Chicken Combo', 9.5),
      createMenuItem('Spicy Wings', 7.5),
      createMenuItem('Buttermilk Biscuit', 2.5),
    ]
  }

  return [
    createMenuItem('House Special Bowl', 8.5),
    createMenuItem('Signature Wrap', 7.75),
    createMenuItem('Fresh Lemonade', 2.95),
  ]
}

export function serializeMenu(menu: MenuItem[]): string {
  return menu.map((item) => `${item.name} | ${item.price.toFixed(2)}`).join('\n')
}

export function parseMenuText(menuText: string): MenuItem[] | null {
  const lines = menuText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return []
  }

  const parsed: MenuItem[] = []

  for (const line of lines) {
    const [namePart, pricePart] = line.split('|').map((part) => part?.trim())

    if (!namePart || !pricePart) {
      return null
    }

    const price = Number(pricePart)
    if (!Number.isFinite(price) || price <= 0) {
      return null
    }

    parsed.push(createMenuItem(namePart, price))
  }

  return parsed
}
