import React, { useEffect, useState } from 'react'
import { Navbar } from '@widgets/landing/Navbar'
import { Hero } from '@widgets/landing/Hero'
import { Background3D } from '@widgets/landing/Background3D'
import { Contacts } from '@widgets/landing/Contacts'
import { About } from '@widgets/landing/About'
import { LoginModal } from '@widgets/landing/LoginModal'
import { AmbientRays } from '@widgets/landing/AmbientRays'
import { RegisterModal } from '@widgets/landing/RegisterModal'
import { getJson } from '@shared/api/http'

export const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userLogin, setUserLogin] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('access_token')
    const storedLogin = localStorage.getItem('user_login')
    if (stored) {
      setAccessToken(stored)
      setUserLogin(storedLogin)
      getJson<{ login: string; user_id?: string }>('/auth/me', stored).then((res) => {
        if ('data' in res) {
          const nextLogin = res.data.login || storedLogin
          setUserLogin(nextLogin)
          if (nextLogin) {
            localStorage.setItem('user_login', nextLogin)
          }
        } else {
          setAccessToken(null)
          setUserLogin(null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_login')
        }
      })
    }
  }, [])

  const handleAuthSuccess = (token: string, login: string) => {
    setAccessToken(token)
    setUserLogin(login)
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_login', login)
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
  }

  const handleLogout = () => {
    setAccessToken(null)
    setUserLogin(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
  }

  const handleProfile = () => {
    window.location.assign('/profile')
  }

  return (
    <div className="relative w-full min-h-screen bg-warm-50 text-gray-900 selection:bg-warm-400 selection:text-gray-900 overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-0">
        <Background3D />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <div className="absolute -left-1/3 top-[-50%] h-2/3 w-2/3 bg-[radial-gradient(circle_at_25%_20%,rgba(251,191,36,0.35),transparent_55%)] blur-3xl" />
        <div className="absolute right-[-25%] bottom-[-10%] h-3/4 w-1/2 bg-[radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.25),transparent_100%)] blur-3xl" />
      </div>
      <AmbientRays />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          onLoginClick={() => setIsLoginOpen(true)}
          userLogin={userLogin}
          onLogout={handleLogout}
          onProfile={handleProfile}
        />
        {accessToken && (
          <div className="absolute right-4 top-24 z-20">
          </div>
        )}
        <main className="flex-grow flex flex-col">
          <Hero />
          <About />
          <Contacts />
        </main>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
