import { describe, it, expect } from 'vitest'
import { formatCurrency, formatNumber, formatPercent, formatArea } from '@/lib/formatters'

describe('Formatters Utility', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1200)).toBe('NPR 1,200')
    expect(formatCurrency(1500000, true)).toBe('NPR 1.5M')
  })

  it('formats compact numbers correctly', () => {
    expect(formatNumber(1006656)).toBe('1M')
    expect(formatNumber(402995)).toBe('403K')
  })

  it('formats percentage correctly', () => {
    expect(formatPercent(42.345)).toBe('42.3%')
  })

  it('formats land area in km²', () => {
    expect(formatArea(464.24)).toBe('464.2 km²')
  })
})
