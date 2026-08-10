import React from 'react'

interface ProgressBarProps {
  label: string
  value: number
  max?: number
  color?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  color = 'bg-emerald-500'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-end">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-900">{Math.round(value)}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
