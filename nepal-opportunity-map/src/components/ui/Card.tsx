import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, glass = false, padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          glass ? 'glass-panel' : 'card',
          hover ? 'card-hover cursor-pointer' : '',
          paddingClasses[padding],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components for consistent card sections
export const CardHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

export const CardTitle = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <h3 className={`font-semibold text-peak-700 text-base leading-snug ${className}`}>
    {children}
  </h3>
)

export const CardBody = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => <div className={className}>{children}</div>

export const CardFooter = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`mt-4 pt-4 border-t border-peak-100 ${className}`}>{children}</div>
)
