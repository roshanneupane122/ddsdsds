import React from 'react'
import { useUIStore } from '@/store'

interface PageContainerProps {
  children: React.ReactNode
  fullWidth?: boolean
  className?: string
}

/** Wraps page content with responsive padding accounting for header + sidebar */
export const PageContainer = ({ children, fullWidth = false, className = '' }: PageContainerProps) => {
  const { isSidebarOpen } = useUIStore()

  return (
    <main
      className={[
        'min-h-screen pt-16 bg-[#F4FBF7] transition-all duration-300',
        isSidebarOpen ? 'lg:pl-60' : 'lg:pl-16',
        className,
      ].join(' ')}
      id="main-content"
    >
      <div className={fullWidth ? 'h-full' : 'max-w-screen-xl mx-auto px-4 py-6 md:px-6 lg:px-8'}>
        {children}
      </div>
    </main>
  )
}

export const Footer = () => {
  const { isSidebarOpen } = useUIStore()
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={[
        'bg-white border-t border-emerald-100/90 py-5 px-6 transition-all duration-300 shadow-2xs',
        isSidebarOpen ? 'lg:pl-60' : 'lg:pl-16',
      ].join(' ')}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <p className="text-xs text-slate-700 font-medium">
            © {currentYear} Catalyst — Nepal Opportunity Map. All rights reserved.
          </p>
        </div>
        <p className="text-xs text-emerald-800 font-mono font-medium">
          753 Municipalities GIS Intelligence Engine
        </p>
      </div>
    </footer>
  )
}