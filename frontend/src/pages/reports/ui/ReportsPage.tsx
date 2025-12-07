import { useState } from 'react'
import { Navbar } from '@widgets/landing/Navbar'
import { LoginModal } from '@widgets/landing/LoginModal'
import { RegisterModal } from '@widgets/landing/RegisterModal'
import { CORE_NAV_ITEMS } from '@shared/config/navigation'

export const ReportsPage = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [userLogin, setUserLogin] = useState<string | null>(localStorage.getItem('user_login'))

  const handleAuthSuccess = (token: string, login: string) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_login', login)
    setUserLogin(login)
    setShowLogin(false)
    setShowRegister(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
    setUserLogin(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        userLogin={userLogin}
        onLogout={handleLogout}
        onProfile={() => (window.location.href = '/profile')}
        navItems={CORE_NAV_ITEMS}
      />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="px-10 py-14 text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-500">Отчёты</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Раздел отчётов скоро появится</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Здесь будет витрина выгрузок, аналитика и экспорт данных. Пока готовим функциональность — скоро всё
              заработает.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="/maps"
                className="px-5 py-3 rounded-full bg-black text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Перейти к карте
              </a>
              <button
                onClick={() => setShowLogin(true)}
                className="px-5 py-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onOpenRegister={() => {
          setShowLogin(false)
          setShowRegister(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
