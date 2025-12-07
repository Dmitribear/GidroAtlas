import React from 'react'

const STATS = [
  { label: 'Количество объектов в системе', value: '120+', gradient: 'from-amber-400 to-amber-600' },
  { label: 'Регионов в обработке', value: '50+', gradient: 'from-amber-300 to-amber-500' },
  { label: 'Объектов с оценкой состояния', value: '90%', gradient: 'from-amber-500 to-amber-700' },
]


export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-amber-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-amber-100 border border-amber-200/70 shadow-md shadow-amber-100/70"
          >
            <div className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient} mb-2 display-font`}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-amber-800 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
