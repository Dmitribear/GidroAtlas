import React from 'react'

export const Marquee: React.FC = () => {
  return (
    <div className="py-12 bg-lime-300 -rotate-1 overflow-hidden border-y-2 border-black">
      <div className="whitespace-nowrap flex gap-8 animate-marquee">
        <span className="text-4xl font-bold uppercase tracking-tight text-black flex items-center gap-8">
        Обработка данных <i data-lucide="star" className="w-8 h-8 fill-black" />
        Интерактивная карта <i data-lucide="star" className="w-8 h-8 fill-black" />
        Аналитика <i data-lucide="star" className="w-8 h-8 fill-black" />
        Приоритезация объектов <i data-lucide="star" className="w-8 h-8 fill-black" />
        Модель состояния <i data-lucide="star" className="w-8 h-8 fill-black" />
        База данных <i data-lucide="star" className="w-8 h-8 fill-black" />
        Интерактивная карта <i data-lucide="star" className="w-8 h-8 fill-black" />
        Аналитика <i data-lucide="star" className="w-8 h-8 fill-black" />
        Приоритезация объектов <i data-lucide="star" className="w-8 h-8 fill-black" />
        Модель состояния <i data-lucide="star" className="w-8 h-8 fill-black" />
        </span>
      </div>
    </div>
  )
}
