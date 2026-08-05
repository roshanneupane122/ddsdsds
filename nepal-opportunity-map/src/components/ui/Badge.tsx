import type { ConfidenceLevel, OpportunityCategory } from '@/types'
import { snakeToTitle } from '@/lib/formatters'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-peak-100 text-peak-700',
  success: 'bg-terraced-100 text-terraced-700',
  warning: 'bg-saffron-100 text-saffron-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-mist-100 text-mist-700',
  muted: 'bg-gray-100 text-gray-500',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-1 text-xs',
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {dot && (
      <span
        className="w-1.5 h-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
    )}
    {children}
  </span>
)

// ── Specialized badges ────────────────────────────────────────

const confidenceVariantMap: Record<ConfidenceLevel, BadgeVariant> = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
}

export const ConfidenceBadge = ({ level }: { level: ConfidenceLevel }) => (
  <Badge variant={confidenceVariantMap[level]} dot>
    {level.charAt(0).toUpperCase() + level.slice(1)} Confidence
  </Badge>
)

const categoryColors: Record<string, BadgeVariant> = {
  agribusiness: 'success',
  eco_tourism: 'info',
  manufacturing: 'default',
  digital_services: 'muted',
  renewable_energy: 'warning',
  healthcare: 'danger',
  education: 'info',
  infrastructure: 'default',
  export_trade: 'success',
  financial_services: 'warning',
}

export const CategoryBadge = ({ category }: { category: OpportunityCategory }) => (
  <Badge variant={categoryColors[category] ?? 'default'}>
    {snakeToTitle(category)}
  </Badge>
)
