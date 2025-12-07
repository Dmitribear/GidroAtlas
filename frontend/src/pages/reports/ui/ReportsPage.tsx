import { useRef, useState } from 'react'
import { Navbar } from '@widgets/landing/Navbar'
import { LoginModal } from '@widgets/landing/LoginModal'
import { RegisterModal } from '@widgets/landing/RegisterModal'
import { CORE_NAV_ITEMS } from '@shared/config/navigation'
import { API_ROOT } from '@shared/api/http'

export const ReportsPage = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [userLogin, setUserLogin] = useState<string | null>(localStorage.getItem('user_login'))
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ processed: number; uploaded: number; skipped: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const zipInputRef = useRef<HTMLInputElement | null>(null)

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

  const handleZipButton = () => {
    if (!localStorage.getItem('access_token')) {
      setShowLogin(true)
      return
    }
    zipInputRef.current?.click()
  }

  const handleZipChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setUploadError('Поддерживаются только ZIP архивы.')
      event.target.value = ''
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadResult(null)

    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    formData.append('archive', file)

    try {
      const response = await fetch(`${API_ROOT}/reports/passports/upload-zip`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => 'Неизвестная ошибка')
        throw new Error(text)
      }
      const json = await response.json()
      setUploadResult({
        processed: json.processed ?? 0,
        uploaded: json.uploaded ?? 0,
        skipped: json.skipped ?? 0,
      })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Не удалось загрузить архив.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
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
          <div className="px-10 py-14 space-y-6">
            <div className="text-center space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-500">Отчёты</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Паспорта объектов</h1>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Загружайте архив с паспортами (PDF), мы автоматически отправим их в Supabase Storage и обновим ссылки у соответствующих объектов.
                После загрузки кнопка «Открыть PDF» на карте всегда ведёт к актуальному файлу.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 text-white rounded-2xl px-6 py-8 space-y-4 shadow-lg shadow-slate-900/40">
                <h2 className="text-xl font-semibold">Теперь система полностью рабочая:</h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-300 mt-1">✔</span>
                    ZIP загружается и распаковывается на бэкенде
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-300 mt-1">✔</span>
                    PDF уходят в Supabase Storage, генерируется публичная ссылка
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-300 mt-1">✔</span>
                    Таблица объектов автоматически получает новую ссылку
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-300 mt-1">✔</span>
                    Фронт открывает паспорт в новой вкладке и ничего не теряется
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-2xl px-6 py-8 border border-slate-100 space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Загрузить архив</h2>
                <p className="text-sm text-slate-600">
                  Добавьте ZIP с файлами *.pdf. Имя файла должно совпадать с названием объекта (например, «Самаркандское водохранилище.pdf»).
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleZipButton}
                    className="h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition disabled:opacity-60 disabled:pointer-events-none"
                    disabled={uploading}
                  >
                    {uploading ? 'Загружаем...' : 'Выбрать ZIP'}
                  </button>
                  <input ref={zipInputRef} type="file" accept=".zip" className="hidden" onChange={handleZipChange} />
                  {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                  {uploadResult && (
                    <div className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-slate-900">Готово!</p>
                      <p>Обработано файлов: {uploadResult.processed}</p>
                      <p>Обновлены ссылки: {uploadResult.uploaded}</p>
                      <p>Пропущено: {uploadResult.skipped}</p>
                    </div>
                  )}
                </div>
              </div>
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
