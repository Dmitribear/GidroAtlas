import React from 'react'

export const ContactFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-amber-100 text-amber-900 py-24 px-6 rounded-t-[3rem] mt-12 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-amber-200 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-none mb-8 display-font">
              Связаться <br /> <span className="text-amber-700">с нами</span>
            </h2>

            <p className="text-xl text-amber-800 max-w-md mb-10">
              Если вы заинтересованы в сотрудничестве, тестировании системы или у вас есть вопросы — оставьте сообщение, и мы свяжемся с вами.
            </p>

            <a
              href="mailto:gidroatlas.project@gmail.com"
              className="inline-flex items-center gap-4 text-3xl font-medium border-b-2 border-amber-400 pb-2 hover:text-amber-700 hover:border-amber-600 transition-all"
            >
              gidroatlas.project@gmail.com
              <i data-lucide="send" className="w-8 h-8" />
            </a>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-amber-200 shadow-lg shadow-amber-200/60">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800 ml-2">Имя</label>
                  <input
                    type="text"
                    placeholder="Иванов Иван"
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800 ml-2">Email</label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-amber-800 ml-2">Тип обращения</label>
                <div className="flex flex-wrap gap-3">
                  {['Консультация', 'Сотрудничество', 'Вопрос по системе'].map((label) => (
                    <label key={label} className="cursor-pointer">
                      <input type="checkbox" className="peer sr-only" />
                      <span className="inline-block px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-800 peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500 transition-all hover:bg-amber-200">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-800 ml-2">Сообщение</label>
                <textarea
                  rows={4}
                  placeholder="Опишите суть обращения..."
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                ></textarea>
              </div>

              <button className="w-full py-4 bg-amber-500 text-amber-900 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-300/60">
                Отправить
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-center items-center pt-8 border-t border-amber-200 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
            <span className="font-semibold text-amber-900">GidroAtlas 2025</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
