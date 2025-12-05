import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="relative py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full bg-warm-100 text-warm-700">
            Почему выбирают нас
            <span className="w-2 h-2 rounded-full bg-warm-500 inline-block animate-pulse" />
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            GidroAtlas — единый слой данных и сервисов для работы с водными объектами
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Стандартизируем, очищаем и обновляем данные, чтобы аналитики, инженеры и менеджеры могли принимать решения
            быстрее и точнее.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Объектов в каталоге', value: '1500+' },
              { label: 'Доступность', value: '24/7' },
              { label: 'Регионов покрыто', value: '28 регионов' },
              { label: 'Интеграции', value: 'API и экспорты' },
            ].map((item) => (
              <div key={item.label} className="bg-white/70 backdrop-blur-lg border border-warm-100 rounded-2xl p-5 shadow-lg shadow-warm-200/30">
                <div className="text-3xl font-bold text-warm-600">{item.value}</div>
                <div className="text-sm text-gray-600 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-to-br from-warm-100 via-white to-warm-50 rounded-[28px] blur-2xl opacity-80" />
          <div className="relative bg-white rounded-[24px] p-8 shadow-2xl shadow-warm-300/30 border border-warm-100">
            <div className="grid grid-cols-2 gap-4">
              {['Каталог объектов', 'Мониторинг', 'Региональные данные', 'Экспорт и API', 'Безопасность', 'Поддержка'].map((tag, idx) => (
                <div key={tag} className="p-4 rounded-2xl bg-warm-50 border border-warm-100/70">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center font-bold mb-3">
                    {idx + 1}
                  </div>
                  <p className="text-gray-900 font-semibold">{tag}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Компоненты подключаются и обновляются без простоя сервиса.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
