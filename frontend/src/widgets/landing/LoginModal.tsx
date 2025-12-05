import React, { useState } from 'react'
import { postJson } from '@shared/api/http'
import { supabase } from '@shared/api/supabaseClient'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenRegister: () => void
  onAuthSuccess: (token: string, login: string) => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister, onAuthSuccess }) => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await postJson<{ access_token: string }>('/auth/login', {
      login: login.trim(),
      password,
    })
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onAuthSuccess(result.data.access_token, login.trim())
    onClose()
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    setOauthLoading(provider)
    setError(null)
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          scopes: provider === 'github' ? 'user:email' : provider === 'google' ? 'email profile' : undefined,
          redirectTo: window.location.origin,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось запустить OAuth')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
        <div className="bg-warm-50 px-8 py-6 border-b border-warm-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Вход в GidroAtlas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 bg-white rounded-full p-1 hover:bg-warm-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-warm-400 focus:ring-4 focus:ring-warm-100 outline-none transition-all"
                placeholder="Ваш логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Пароль</label>
                <a href="#" className="text-xs text-warm-600 hover:underline">
                  Забыли пароль?
                </a>
              </div>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-warm-400 focus:ring-4 focus:ring-warm-100 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              className="w-full bg-warm-400 text-gray-900 font-bold py-3.5 rounded-xl hover:bg-warm-500 transition-all shadow-lg shadow-warm-400/20 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={onOpenRegister}
              className="text-warm-600 font-semibold hover:underline bg-transparent border-0 p-0"
            >
              Создать учетную запись
            </button>
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">Войти через</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition disabled:opacity-60"
                disabled={!!oauthLoading}
              >
                {oauthLoading === 'github' ? 'Открываем GitHub...' : 'GitHub'}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition disabled:opacity-60"
                disabled={!!oauthLoading}
              >
                {oauthLoading === 'google' ? 'Открываем Google...' : 'Gmail'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
