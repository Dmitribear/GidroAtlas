import { User, Droplets, Upload } from "lucide-react"

interface HeaderProps {
  onUploadCsv?: () => void
  isUploading?: boolean
}

export function Header({ onUploadCsv, isUploading }: HeaderProps) {
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
          Отчёты
        </a>
        <a
          href="#"
          className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          Аналитика
        </a>
      </nav>

      <div className="ml-auto flex items-center gap-3 text-xs">
        <button
          onClick={onUploadCsv}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {isUploading ? "Загрузка..." : "CSV"}
        </button>
        <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Справка
        </a>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-white font-medium bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          <User className="w-3.5 h-3.5" />
          Войти
        </button>
      </div>
    </header>
  )
}
