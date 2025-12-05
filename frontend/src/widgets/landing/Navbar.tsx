import React, { useEffect, useState } from 'react'
import type { NavItem } from './types'
import { Button } from './ui/Button'

interface NavbarProps {
  onLoginClick: () => void
  userLogin?: string | null
  onLogout: () => void
  onProfile: () => void
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, userLogin, onLogout, onProfile }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-slate-100 rounded-full px-6 py-4 flex justify-between items-center shadow-sm transition-all ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <a href="#hero" className="text-2xl font-semibold tracking-tighter flex items-center gap-2 display-font">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
            D
          </div>
          Danlpet
        </a>

        <div className="hidden md:flex gap-8 items-center">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} className="text-sm font-medium hover:text-fuchsia-600 transition-colors">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!userLogin ? (
            <Button
              variant="secondary"
              size="sm"
              className="border border-slate-200"
              onClick={() => {
                onLoginClick()
                setMenuOpen(false)
              }}
            >
              Sign in
            </Button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 border border-slate-200 shadow-sm hover:bg-white transition"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {userLogin}
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 py-2 z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      setMenuOpen(false)
                      onProfile()
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <a
            href="#contact"
            className="group relative px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium overflow-hidden hover:scale-105 transition-transform"
          >
            <span className="relative z-10">Let&apos;s Talk</span>
            <div className="absolute inset-0 bg-fuchsia-500 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
          </a>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 p-6 md:hidden flex flex-col gap-4 shadow-xl">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-base font-medium text-slate-700 py-3 border-b border-slate-200/60 hover:text-fuchsia-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {!userLogin ? (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                onLoginClick()
                setMobileMenuOpen(false)
              }}
            >
              Sign in
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => {
                  onProfile()
                  setMobileMenuOpen(false)
                }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => {
                  onLogout()
                  setMobileMenuOpen(false)
                }}
              >
                Logout
              </button>
            </div>
          )}
          <a
            href="#contact"
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-fuchsia-600 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Let&apos;s Talk
          </a>
        </div>
      )}
    </nav>
  )
}
