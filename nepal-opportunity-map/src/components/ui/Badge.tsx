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
  default: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
  success: 'bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 font-bold',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
  danger: 'bg-red-50 text-red-700 border border-red-200/80',
  info: 'bg-teal-50 text-teal-800 border border-teal-200/80',
  muted: 'bg-slate-100 text-slate-700 border border-slate-200',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs font-semibold tracking-wide',
  md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
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
      'inline-flex items-center gap-1.5 rounded-full uppercase font-mono tracking-wider',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {dot && (
      <span
        className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
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
