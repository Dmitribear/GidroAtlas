import React from 'react'

type ServiceCard = {
  title: string
  description: string
  icon: string
  bullet1: string
  bullet2?: string
  bullet3?: string
  tone?: 'dark' | 'light'
}

const SERVICES: ServiceCard[] = [
  {
    title: 'Интерактивная карта',
    description:
      'Визуализация водоёмов и гидротехнических сооружений на динамической карте. Быстрый доступ к характеристикам объектов.',
    icon: 'map',
    bullet1: 'Поиск по объектам',
    bullet2: 'Просмотр параметров',
    tone: 'light',
  },
  {
    title: 'Аналитика и приоритезация',
    description:
      'Оценка технического состояния и определение объектов, требующих обследования в первую очередь.',
    icon: 'bar-chart-3',
    bullet1: 'Формирование приоритетов',
    bullet2: 'Аналитическая модель',
    bullet3: 'Простая оценка состояния',
    tone: 'dark',
  },
  {
    title: 'Структурированная база данных',
    description:
      'Хранение информации о состоянии сооружений, параметрах и технической документации.',
    icon: 'database',
    bullet1: 'Паспортные данные',
    bullet2: 'Метаданные объектов',
    tone: 'light',
  },
] 

export const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-24 px-6 bg-slate-50 rounded-[3rem] mx-4 mb-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-fuchsia-600 font-semibold tracking-widest uppercase text-xs mb-4 block">Наши возможности</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
            Не просто карта — аналитический инструмент.
          </h2>
          <p className="text-slate-600 text-lg md:text-xl">
            Мы объединяем данные, визуализацию и приоритезацию объектов для оперативной оценки.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className={`p-10 rounded-[2rem] transition-shadow duration-300 ${
                service.tone === 'dark'
                  ? 'bg-slate-900 text-white shadow-xl transform md:-translate-y-4'
                  : 'bg-white shadow-sm hover:shadow-xl'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${
                  service.tone === 'dark' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <i data-lucide={service.icon} className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
              <p className={`leading-relaxed mb-8 ${service.tone === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {service.description}
              </p>
              <ul className="space-y-3">
                {[service.bullet1, service.bullet2, service.bullet3].filter(Boolean).map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm font-medium">
                    <i
                      data-lucide="check-circle-2"
                      className={`w-4 h-4 ${service.tone === 'dark' ? 'text-fuchsia-500' : 'text-blue-500'}`}
                    />
                    <span className={service.tone === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
