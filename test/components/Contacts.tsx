import React from 'react';

export const Contacts: React.FC = () => {
  return (
    <section id="contacts" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 border border-warm-100 shadow-xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Свяжитесь с нами
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Есть вопросы по внедрению GidroAtlas? Наша команда готова помочь вам настроить мониторинг и оптимизировать работу с водными ресурсами.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center text-xl text-warm-600 shrink-0">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Наш офис</h3>
                  <p className="text-gray-600">ул. Водная, д. 12, офис 304<br/>Москва, Россия, 123456</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center text-xl text-warm-600 shrink-0">
                  📧
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Email</h3>
                  <p className="text-gray-600">support@gidroatlas.ru</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center text-xl text-warm-600 shrink-0">
                  📞
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Телефон</h3>
                  <p className="text-gray-600">+7 (495) 123-45-67</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-warm-50 rounded-3xl p-8 border border-warm-100">
             <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
                 <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-warm-400 focus:ring-2 focus:ring-warm-200 outline-none transition-all bg-white" placeholder="Иван Иванов" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                 <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-warm-400 focus:ring-2 focus:ring-warm-200 outline-none transition-all bg-white" placeholder="ivan@example.com" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение</label>
                 <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-warm-400 focus:ring-2 focus:ring-warm-200 outline-none transition-all bg-white" placeholder="Как мы можем помочь?"></textarea>
               </div>
               <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                 Отправить сообщение
               </button>
             </form>
          </div>
        </div>
      </div>
    </section>
  );
};