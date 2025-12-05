import React, { useMemo, useState } from 'react'
import { postJson } from '@shared/api/http'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  onAuthSuccess: (token: string, login: string) => void
}

const loginRegex = /^[A-Za-z0-9]+$/
const passwordRegex = /^[A-Za-z0-9]+$/

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin, onAuthSuccess }) => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validationError = useMemo(() => {
    if (login.trim().length < 8) return 'Логин должен быть не короче 8 символов'
    if (!loginRegex.test(login.trim())) return 'Логин может содержать только буквы и цифры'
    if (password.length < 6) return 'Пароль должен быть не короче 6 символов'
    if (!passwordRegex.test(password)) return 'Пароль может содержать только буквы и цифры'
    return null
  }, [login, password])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    const result = await postJson<{ access_token: string }>('/auth/register', {
      login: login.trim(),
      password,
    })
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setSuccess('Регистрация прошла успешно')
    onAuthSuccess(result.data.access_token, login.trim())
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
        <div className="bg-warm-50 px-8 py-6 border-b border-warm-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Создать новый аккаунт</h2>
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
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-warm-400 focus:ring-4 focus:ring-warm-100 outline-none transition-all"
                placeholder="Только буквы и цифры, от 8 символов"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Пароль</label>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-warm-400 focus:ring-4 focus:ring-warm-100 outline-none transition-all"
                placeholder="Не менее 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <button
              disabled={loading}
              className="w-full bg-warm-400 text-gray-900 font-bold py-3.5 rounded-xl hover:bg-warm-500 transition-all shadow-lg shadow-warm-400/20 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Регистрируем...' : 'Создать аккаунт'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-warm-600 font-semibold hover:underline bg-transparent border-0 p-0"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
