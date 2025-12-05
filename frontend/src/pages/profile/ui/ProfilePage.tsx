import React, { useEffect, useState } from 'react'
import { getJson } from '@shared/api/http'

export const ProfilePage: React.FC = () => {
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setStatus('ready')
      return
    }

    getJson<{ login: string; user_id?: string }>('/auth/me', token).then((res) => {
      if ('data' in res) {
        setUserLogin(res.data.login)
        localStorage.setItem('user_login', res.data.login)
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_login')
      }
      setStatus('ready')
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
    setUserLogin(null)
    window.location.assign('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 text-gray-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg sticky top-0 z-50 rounded-b-xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-3xl font-bold text-gray-900 hover:scale-105 transition-transform cursor-pointer">
          MyApp
        </div>
        <div className="flex items-center gap-4">
          <button className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 hover:scale-105 transition-transform">
            Настройки
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:scale-105 transition-transform"
          >
            Выйти
          </button>
          <a
            href="/maps"
            className="px-5 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 hover:scale-105 transition-transform"
          >
            Карты
          </a>
        </div>
      </nav>

      {/* Контент профиля */}
      <div className="flex items-center justify-center px-6 mt-12">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl border border-warm-100 rounded-3xl p-10 shadow-xl shadow-warm-200/40 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 animate-fadeInDown">
              Профиль
            </h1>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-warm-200 text-sm font-semibold text-gray-800 hover:bg-warm-50 transition"
            >
              ← На главную
            </a>
          </div>

          {status === 'loading' && (
            <p className="text-gray-600 animate-pulse">Загружаем данные профиля...</p>
          )}

          {status === 'ready' && !userLogin && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-gray-700">
                Вы не авторизованы. Пожалуйста, войдите на главной странице.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-400 text-gray-900 font-semibold shadow-md shadow-warm-400/30 hover:bg-warm-500 hover:scale-105 transition-transform"
              >
                Перейти к логину
              </a>
            </div>
          )}{status === 'ready' && userLogin && (
            <div className="space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-warm-50 border border-warm-200 rounded-2xl text-gray-800 shadow-md shadow-warm-200/30">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold">{userLogin}</span>
              </div>
              <p className="text-gray-600">
                Скоро здесь появятся настройки и данные вашего аккаунта.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}