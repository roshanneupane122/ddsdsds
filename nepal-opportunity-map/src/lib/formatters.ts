// ============================================================
// Formatting utilities
// ============================================================

/** Format a number as a compact currency string (USD) */
export const formatCurrency = (value: number, compact = false): string => {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format a large number compactly (1.2K, 3.4M) */
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

/** Format a percentage */
export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`

/** Format an area in km² */
export const formatArea = (km2: number): string =>
  `${formatNumber(km2)} km²`

/** Format a date string (ISO) to a human-readable date */
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(iso)
  )

/** Format a date to relative time ("3 days ago") */
export const formatRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  return rtf.format(-days, 'day')
}

/** Format investment range */
export const formatInvestmentRange = (min: number, max: number): string =>
  `${formatCurrency(min, true)} – ${formatCurrency(max, true)}`

/** Format ROI range */
export const formatROIRange = (min: number, max: number): string =>
  `${min}% – ${max}%`

/** Capitalize first letter */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

/** Convert snake_case to Title Case */
export const snakeToTitle = (str: string): string =>
  str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ')

/** Truncate a string to a max length with ellipsis */
export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str
