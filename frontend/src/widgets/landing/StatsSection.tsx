import React from 'react'

const STATS = [
  { label: 'Happy Clients', value: '50+', gradient: 'from-blue-400 to-teal-400' },
  { label: 'Awards Won', value: '12', gradient: 'from-purple-400 to-pink-400' },
  { label: 'Coffees Drunk', value: '999+', gradient: 'from-orange-400 to-yellow-400' },
  { label: 'Good Vibes', value: '100%', gradient: 'from-lime-400 to-green-400' },
]

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((stat) => (
          <div key={stat.label} className="p-6">
            <div className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient} mb-2 display-font`}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
