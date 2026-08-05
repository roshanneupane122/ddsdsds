import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  featureName?: string
  onReset?: () => void
}

/**
 * Error boundary component.
 * Wrap around map, charts, and reports features to prevent full-page crashes.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary: ${this.props.featureName ?? 'unknown'}]`, error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.96-.834-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-peak-700 mb-1">
            {this.props.featureName
              ? `${this.props.featureName} failed to load`
              : 'Something went wrong'}
          </h3>
          <p className="text-sm text-peak-400 mb-4 max-w-sm">
            {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium text-white bg-terraced-500 rounded-lg hover:bg-terraced-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terraced-400"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for convenience — use when you need error boundary around async content
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  featureName: string
) => {
  const Wrapped = (props: P) => (
    <ErrorBoundary featureName={featureName}>
      <Component {...props} />
    </ErrorBoundary>
  )
  Wrapped.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`
  return Wrapped
}
