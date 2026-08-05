import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

const defaultIcon = (
  <svg className="w-12 h-12 text-peak-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

export const EmptyState = ({
  title,
  description,
  icon = defaultIcon,
  action,
  className = '',
}: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    <div className="mb-4">{icon}</div>
    <h3 className="text-base font-semibold text-peak-600 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-peak-400 max-w-sm mb-5">{description}</p>
    )}
    {action && <div>{action}</div>}
  </div>
)

export const EmptySearchState = ({ query, onClear }: { query: string; onClear: () => void }) => (
  <EmptyState
    title={`No results for "${query}"`}
    description="Try different keywords or adjust your filters."
    icon={
      <svg className="w-12 h-12 text-peak-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    action={
      <button
        onClick={onClear}
        className="text-sm text-terraced-600 hover:text-terraced-700 underline underline-offset-2"
      >
        Clear search
      </button>
    }
  />
)
