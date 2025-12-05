import React, { useEffect, useState } from 'react'
import { getJson } from '@shared/api/http'

export const ProfilePage: React.FC = () => {
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const cachedLogin = localStorage.getItem('user_login')
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
    <div className="min-h-screen bg-warm-50 text-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl border border-warm-100 rounded-3xl p-10 shadow-xl shadow-warm-200/40">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Профиль</h1>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-warm-200 text-sm font-semibold text-gray-800 hover:bg-warm-50 transition"
          >
            ← На главную
          </a>
        </div>

        {status === 'loading' && <p className="text-gray-600">Загружаем данные профиля...</p>}

        {status === 'ready' && !userLogin && (
          <div className="space-y-3">
            <p className="text-gray-700">Вы не авторизованы. Пожалуйста, войдите на главной странице.</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-400 text-gray-900 font-semibold shadow-md shadow-warm-400/30 hover:bg-warm-500 transition"
            >
              Перейти к логину
            </a>
          </div>
        )}

        {status === 'ready' && userLogin && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-warm-50 border border-warm-200 rounded-2xl text-gray-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold">{userLogin}</span>
            </div>
            <p className="text-gray-600">Скоро здесь появятся настройки и данные вашего аккаунта.</p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-warm-200 text-sm font-semibold text-gray-800 hover:bg-warm-50 transition"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
