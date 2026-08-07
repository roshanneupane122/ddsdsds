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
        'min-h-screen pt-16 bg-[#0A0C10] transition-all duration-300',
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
        'bg-[#08090D] border-t border-white/5 py-4 px-6 transition-all duration-300',
        isSidebarOpen ? 'lg:pl-60' : 'lg:pl-16',
      ].join(' ')}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">
          © {currentYear} Catalyst — Nepal Opportunity Map. All rights reserved.
        </p>
        <p className="text-[10px] text-slate-700 font-mono uppercase tracking-wider">
          Municipality data: Nepal federal restructuring 2017 (753 local units)
        </p>
      </div>
    </footer>
  )
}