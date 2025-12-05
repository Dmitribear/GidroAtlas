import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Card 1: Description */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-warm-200/50 hover:bg-white/50 transition-colors shadow-xl">
          <div className="w-12 h-12 bg-warm-400 rounded-full flex items-center justify-center text-2xl mb-6 shadow-md">
            🌍
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Что такое GidroAtlas?
          </h2>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            GidroAtlas — это платформа, которая использует интерактивную карту и элементы искусственного интеллекта, чтобы показывать состояние водных ресурсов и гидротехнических сооружений Казахстана.
          </p>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg mt-4">
            Система помогает быстро находить нужные объекты, изучать их характеристики и определять, какие сооружения требуют обследования в первую очередь.
          </p>
        </div>

        {/* Card 2: Goal */}
        <div className="bg-gray-900 text-white backdrop-blur-md rounded-[2rem] p-8 md:p-12 shadow-xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-warm-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-warm-500 rounded-full flex items-center justify-center text-2xl text-gray-900 font-bold shadow-md">
                🎯
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-warm-50">
                Цель проекта
              </h2>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-base md:text-lg">
              MVP создаётся специально для того чтобы посмотреть как пойдет процесс завлечения заказчика. Его основная цель — дать пользователю простую карту, на которой отображаются водоёмы и гидротехнические сооружения.
            </p>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg mt-4">
              Система должна позволять искать объекты, смотреть их характеристики и показывать уровень их технического состояния. Кроме этого, в MVP входит простая модель приоритезации — она помогает определить, какие объекты важнее обследовать.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};