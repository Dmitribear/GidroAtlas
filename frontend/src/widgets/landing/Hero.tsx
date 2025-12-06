import React from 'react'

interface HeroProps {
  onPrimaryCta?: () => void
}

export const Hero: React.FC<HeroProps> = ({ onPrimaryCta }) => {
  return (
    <section id="work">
      <header id="hero" className="relative pt-40 pb-20 px-6 overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[50vw] h-[50vw] bg-amber-100 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[40vw] h-[40vw] bg-yellow-200 rounded-full blur-3xl opacity-40 animate-[pulse_6s_ease-in-out_infinite]" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wide mb-8 hover:bg-amber-100 transition-colors cursor-default shadow-sm shadow-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
            Актуальные данные по гидрообъектам
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight leading-[0.9] mb-8 text-slate-900 display-font">
            GidroAtlas <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 text-transparent bg-clip-text italic pr-4 drop-shadow-[0_10px_30px_rgba(245,158,11,0.35)]">
              ИИ-система
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
          Платформа, которая отображает состояние водных ресурсов и гидротехнических сооружений Казахстана
          с помощью интерактивной карты и технологий искусственного интеллекта. MVP позволяет искать объекты,
          изучать их характеристики и определять приоритет обследования.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button
              className="px-8 py-4 bg-amber-500 text-slate-900 rounded-full text-lg font-semibold hover:bg-amber-400 hover:scale-105 transition-all duration-300 shadow-xl shadow-amber-400/40 flex items-center gap-2"
              onClick={onPrimaryCta}
            >
              Начать использование
              <i data-lucide="arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    </section>
  )
}
