import { useEffect } from 'react'

declare global {
  interface Window {
    lucide?: { createIcons: () => void }
  }
}

export const useLucide = () => {
  useEffect(() => {
    window.lucide?.createIcons()
  })
}
