import React, { useEffect, useState } from 'react'
import { Navbar } from '@widgets/landing/Navbar'
import { getJson } from '@shared/api/http'
import { supabase } from '@shared/api/supabaseClient'
import { CORE_NAV_ITEMS } from '@shared/config/navigation'

type UserRole = 'guest' | 'expert'

export const ProfilePage: React.FC = () => {
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>('guest')
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedLogin = localStorage.getItem('user_login')

    if (!token) {
      setStatus('ready')
      return
    }

    getJson<{ login: string; user_id?: string }>('/auth/me', token).then((res) => {
      if ('data' in res) {
        const loginValue = res.data.login || storedLogin || null
        setUserLogin(loginValue)
        if (loginValue) {
          localStorage.setItem('user_login', loginValue)
          fetchRole(loginValue).catch(() => setRole('guest'))
        }
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_login')
      }
      setStatus('ready')
    })
  }, [])

  const fetchRole = async (login: string) => {
    const { data, error } = await supabase.from('users').select('role').eq('login', login).single()
    if (error) {
      setRole('guest')
      return
    }
    const value = (data as { role?: string } | null)?.role
    setRole(value === 'expert' ? 'expert' : 'guest')
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
    setUserLogin(null)
    setRole('guest')
    window.location.assign('/')
  }


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar
        onLoginClick={() => (window.location.href = '/')}
        userLogin={userLogin}
        onLogout={handleLogout}
        onProfile={() => (window.location.href = '/profile')}
        navItems={CORE_NAV_ITEMS}
      />

      <div className="pt-24 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Профиль</p>
              <h1 className="text-2xl font-bold text-gray-900">Ваши данные</h1>
            </div>
          </div>

          {status === 'loading' && <p className="text-gray-600">Загрузка профиля...</p>}

          {status === 'ready' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Логин</p>
                <p className="text-lg font-semibold text-gray-900">{userLogin || 'Не авторизован'}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Роль</p>
                <p className="text-lg font-semibold text-gray-900">{role === 'expert' ? 'Эксперт' : 'Гость'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
