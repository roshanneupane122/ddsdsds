import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6 md:p-8',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, glass = false, padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          glass
            ? 'backdrop-blur-md bg-white/90 border border-emerald-100/80 shadow-sm rounded-2xl'
            : 'bg-white rounded-2xl border border-emerald-100/80 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)]',
          hover ? 'hover:shadow-[0_12px_30px_-6px_rgba(16,185,129,0.14)] hover:border-emerald-300 hover:-translate-y-0.5 cursor-pointer transition-all duration-200' : '',
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
  <h3 className={`font-bold text-slate-900 text-base leading-snug tracking-tight ${className}`}>
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
  <div className={`mt-4 pt-4 border-t border-emerald-100/80 ${className}`}>{children}</div>
)
