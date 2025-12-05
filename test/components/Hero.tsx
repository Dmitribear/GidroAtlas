import React from 'react';
import { Button } from './ui/Button';

export const Hero: React.FC = () => {
  return (
    <div id="hero" className="w-full max-w-7xl mx-auto px-6 pt-32 pb-12 flex flex-col items-center text-center relative z-10">
      
      {/* Main Headlines */}
      <div className="animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
          GidroAtlas <br />
          <span className="text-warm-500 font-bold">Система Мониторинга</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Передовая картография водных ресурсов и анализ гидрологических данных в реальном времени. 
          Управляйте экологическим воздействием с точностью и ясностью.
        </p>
      </div>

      {/* Feature Block (Replaces Phone) */}
      <div className="mt-8 max-w-3xl w-full mx-auto perspective-1000 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 p-8 md:p-12 shadow-2xl shadow-warm-500/10 hover:shadow-warm-500/20 transition-all duration-500 transform hover:-translate-y-1">
          
          <div className="flex flex-col items-center gap-6">
             <div className="w-16 h-16 bg-warm-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-warm-400/40 mb-2">
                🌊
             </div>
             
             <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
               Ваша аналитика — под контролем
             </h3>
             
             <p className="text-gray-600 leading-relaxed max-w-lg">
               Наш сервис предоставляет полные данные о состоянии водных объектов, прогнозирует изменения 
               уровня воды и помогает принимать своевременные решения для предотвращения паводков.
             </p>

             <div className="pt-4 w-full sm:w-auto">
                <a href="#about" className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Перейти в панель управления
                    <svg 
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </a>
             </div>
          </div>

          {/* Decorative stats elements */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gray-200/50 pt-8">
             <div className="text-center">
                <div className="text-2xl font-bold text-warm-600">24/7</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Мониторинг</div>
             </div>
             <div className="text-center border-l border-gray-200/50">
                <div className="text-2xl font-bold text-warm-600">99%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Точность</div>
             </div>
             <div className="text-center border-l border-gray-200/50">
                <div className="text-2xl font-bold text-warm-600">50+</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Регионов</div>
             </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};