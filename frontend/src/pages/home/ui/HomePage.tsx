import { useEffect, useState } from 'react'
import { Navbar } from '@widgets/landing/Navbar'
import { Hero } from '@widgets/landing/Hero'
import { Marquee } from '@widgets/landing/Marquee'
import { ServicesSection } from '@widgets/landing/ServicesSection'
import { StatsSection } from '@widgets/landing/StatsSection'
import { ContactFooter } from '@widgets/landing/ContactFooter'
import { LoginModal } from '@widgets/landing/LoginModal'
import { RegisterModal } from '@widgets/landing/RegisterModal'
import { getJson, postJson } from '@shared/api/http'
import { supabase } from '@shared/api/supabaseClient'
import { useLucide } from '@shared/lib/useLucide'

export const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useLucide()

  useEffect(() => {
    const syncFromSupabase = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session?.user) return

      const meta = session.user.user_metadata || {}
      const provider = session.user.app_metadata?.provider
      const emailPrefix = session.user.email?.split('@')[0]
      const oauthLogin =
        (meta.user_name as string) || (meta.preferred_username as string) || emailPrefix || session.user.id
      const syntheticPassword = `${provider}:${session.user.id}`

      const token = await ensureBackendToken(oauthLogin, syntheticPassword)
      if (token) {
        setUserLogin(oauthLogin)
        localStorage.setItem('access_token', token)
        localStorage.setItem('user_login', oauthLogin)
      }
    }

    const stored = localStorage.getItem('access_token')
    const storedLogin = localStorage.getItem('user_login')
    if (stored) {
      setUserLogin(storedLogin)
      getJson<{ login: string; user_id?: string }>('/auth/me', stored).then((res) => {
        if ('data' in res) {
          const nextLogin = res.data.login || storedLogin
          setUserLogin(nextLogin)
          if (nextLogin) {
            localStorage.setItem('user_login', nextLogin)
          }
        } else {
          setUserLogin(null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_login')
        }
      })
    }
    syncFromSupabase().catch(() => {})
  }, [])

  const ensureBackendToken = async (login: string, password: string) => {
    setAuthError(null)
    const register = await postJson<{ access_token: string }>('/auth/register', { login, password })
    if ('data' in register) return register.data.access_token
    if (register.error && !register.error.toLowerCase().includes('exists') && !register.error.includes('409')) {
      setAuthError(register.error)
      return null
    }
    const loginRes = await postJson<{ access_token: string }>('/auth/login', { login, password })
    if ('data' in loginRes) return loginRes.data.access_token
    setAuthError(loginRes.error)
    return null
  }

  const handleAuthSuccess = (token: string, login: string) => {
    setUserLogin(login)
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_login', login)
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
  }

  const handleLogout = () => {
    setUserLogin(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
  }

  const handleProfile = () => {
    window.location.assign('/profile')
  }

  const goToMaps = () => {
    window.location.assign('/maps')
  }

  return (
    <div className="relative w-full min-h-screen bg-white text-slate-900 selection:bg-fuchsia-300 selection:text-fuchsia-900 overflow-x-hidden font-sans">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          onLoginClick={() => setIsLoginOpen(true)}
          userLogin={userLogin}
          onLogout={handleLogout}
          onProfile={handleProfile}
        />

        <main className="flex-grow flex flex-col">
          <Hero onPrimaryCta={goToMaps} onSecondaryCta={goToMaps} />
          <Marquee />
          <ServicesSection />
          <StatsSection />
        </main>
      </div>

      {authError && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg border border-red-200 shadow">
          {authError}
        </div>
      )}

      <ContactFooter />

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
