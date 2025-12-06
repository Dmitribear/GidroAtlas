import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  rightMeta?: ReactNode
  className?: string
}

export const Card = ({ title, subtitle, children, rightMeta, className = '' }: CardProps) => (
  <div className={`bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-200/60 p-6 ${className}`}>
    {(title || subtitle || rightMeta) && (
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          {subtitle && <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-500">{subtitle}</p>}
          {title && <h3 className="text-lg font-semibold leading-tight mt-1">{title}</h3>}
        </div>
        {rightMeta && <div className="text-xs text-slate-500 text-right">{rightMeta}</div>}
      </div>
    )}
    {children}
  </div>
)
