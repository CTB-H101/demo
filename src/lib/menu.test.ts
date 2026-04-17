import { describe, expect, it } from 'vitest'
import { createSuggestedMenuFromName, parseMenuText, serializeMenu } from './menu'

describe('menu utilities', () => {
  it('creates burger-focused menu for burger trucks', () => {
    const menu = createSuggestedMenuFromName('Harvard Burger Truck')
    expect(menu).toHaveLength(3)
    expect(menu[0].name.toLowerCase()).toContain('burger')
  })

  it('parses menu text with dish and price per line', () => {
    const parsed = parseMenuText('Cheese Burger | 8.50\nFrench Fries | 3.20')
    expect(parsed).not.toBeNull()
    expect(parsed?.[0].name).toBe('Cheese Burger')
    expect(parsed?.[1].price).toBe(3.2)
  })

  it('returns null when menu text format is invalid', () => {
    expect(parseMenuText('Cheese Burger 8.50')).toBeNull()
    expect(parseMenuText('Cheese Burger | not-a-number')).toBeNull()
    expect(parseMenuText('Free Water | 0')).toBeNull()
  })

  it('serializes menu as editable text', () => {
    const menu = createSuggestedMenuFromName('Any Truck')
    const text = serializeMenu(menu)
    expect(text).toContain('|')
  })
})
