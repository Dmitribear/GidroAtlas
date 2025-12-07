import React from 'react';

export const Contacts: React.FC = () => {
  return (
    <section id="contacts" className="relative py-24 bg-warm-50/60">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full bg-warm-100 text-warm-700">
            Всегда на связи
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping" />
          </p>

          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Свяжитесь с нами, чтобы подключить команды и проекты.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Отвечаем быстро, помогаем настроить доступы и интеграции под ваши задачи.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Почта', value: 'support@gidroatlas.com' },
              { label: 'Telegram', value: '@gidroatlas_support' },
              { label: 'Телефон', value: '+7 (495) 000-00-00' },
              { label: 'График', value: 'Пн–Пт, 10:00–19:00' },
            ].map((item) => (
              <div key={item.label} className="p-5 rounded-2xl bg-white border border-warm-100 shadow-md shadow-warm-200/40">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-warm-200/60 via-white to-warm-50 rounded-[24px] blur-2xl opacity-80" />
          <div className="relative bg-white rounded-[22px] p-6 shadow-xl border border-warm-100">
            <div className="aspect-[4/3] rounded-[18px] overflow-hidden bg-gradient-to-br from-warm-100 via-white to-warm-50 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🌊</div>
                <p className="text-gray-900 font-bold text-xl">Назначим демо и соберём ваш кейс</p>
                <p className="text-gray-600 mt-2">Покажем данные и процессы на примере ваших задач.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
