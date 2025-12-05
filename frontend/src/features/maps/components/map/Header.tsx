import { User, Droplets, Upload, LogOut } from 'lucide-react'

interface HeaderProps {
  onUploadCsv?: () => void
  isUploading?: boolean
  userLogin?: string | null
  onLogout?: () => void
}

export function Header({ onUploadCsv, isUploading, userLogin, onLogout }: HeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 flex items-center px-4 bg-white shrink-0">
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
          <Droplets className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          GidroAtlas
        </span>
      </div>

      <nav className="flex items-center gap-0.5 text-xs font-medium">
        <a href="#" className="px-2.5 py-1.5 text-blue-600 bg-blue-50 rounded-md">
          Карта
        </a>
        <a
          href="#"
          className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          Слои
        </a>
        <a
          href="#"
          className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          Справка
        </a>
      </nav>

      <div className="ml-auto flex items-center gap-3 text-xs">
        <button
          onClick={onUploadCsv}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {isUploading ? 'Загрузка...' : 'CSV'}
        </button>
        <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Отчёты
        </a>
        {!userLogin ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-white font-medium bg-blue-600 rounded-md">
            <User className="w-3.5 h-3.5" />
            Войти
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{userLogin}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Выйти
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
