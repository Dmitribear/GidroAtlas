import React from 'react'

interface HeroProps {
  onPrimaryCta?: () => void
  onSecondaryCta?: () => void
}

export const Hero: React.FC<HeroProps> = ({ onPrimaryCta, onSecondaryCta }) => {
  return (
    <section id = "work">
    <header id="hero" className="relative pt-40 pb-20 px-6 overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[50vw] h-[50vw] bg-purple-200 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[40vw] h-[40vw] bg-lime-200 rounded-full blur-3xl opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wide mb-8 hover:bg-orange-200 transition-colors cursor-default">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></span>
          Новая автоматизированная система
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight leading-[0.9] mb-8 text-slate-900 display-font">
          GidroAtlas <br />
          <span className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text italic pr-4">
            ИИ-система
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
          Платформа, которая отображает состояние водных ресурсов и гидротехнических сооружений Казахстана
          с помощью интерактивной карты и технологий искусственного интеллекта. MVP позволяет искать объекты,
          изучать их характеристики и определять приоритет обследования.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            className="px-8 py-4 bg-slate-900 text-white rounded-full text-lg font-medium hover:bg-fuchsia-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-fuchsia-500/20 flex items-center gap-2"
            onClick={onPrimaryCta}
          >
            Начать использование
            <i data-lucide="arrow-right" className="w-5 h-5" />
          </button>
          <button
            className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-full text-lg font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
            onClick={onSecondaryCta}
          >
            <i data-lucide="play-circle" className="w-5 h-5 text-slate-400" />
            Демонстрация
          </button>
        </div>
      </div>
    </header>
    </section>
  )
}
