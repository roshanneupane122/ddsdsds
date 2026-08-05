// Skeleton loading placeholder components

interface SkeletonProps {
  className?: string
  rounded?: boolean
}

const base = 'animate-pulse-slow bg-peak-100'

export const Skeleton = ({ className = '', rounded = false }: SkeletonProps) => (
  <div className={[base, rounded ? 'rounded-full' : 'rounded', className].join(' ')} />
)

export const SkeletonText = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
)

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`card p-5 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="card overflow-hidden">
    <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="px-4 py-3 bg-peak-50 border-b border-peak-100">
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div
        key={row}
        className="grid border-b border-peak-50 last:border-b-0"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, col) => (
          <div key={col} className="px-4 py-3">
            <Skeleton className={`h-4 ${col === 0 ? 'w-full' : 'w-3/4'}`} />
          </div>
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonMap = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-mist-100 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-mist-100 to-peak-100 animate-pulse-slow" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-peak-300" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
        </div>
        <p className="text-sm text-peak-400">Loading map…</p>
      </div>
    </div>
  </div>
)
