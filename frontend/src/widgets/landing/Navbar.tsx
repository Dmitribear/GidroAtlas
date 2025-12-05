import React, { useEffect, useState } from 'react';
import type { NavItem } from './types';
import { Button } from './ui/Button';

interface NavbarProps {
  onLoginClick: () => void;
  userLogin?: string | null;
  onLogout: () => void;
  onProfile: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', href: '#hero' },
  { label: 'Карта', href: '#map' },
  { label: 'О продукте', href: '#about' },
  { label: 'Контакты', href: '#contacts' },
  { label: 'Войти', href: '#login', isButton: true },
];

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, userLogin, onLogout, onProfile }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-warm-50/80 backdrop-blur-xl py-3 shadow-md border-b border-warm-200/50' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-warm-400 text-gray-900 flex items-center justify-center rounded-xl font-bold text-xl shadow-lg shadow-warm-400/30 group-hover:rotate-12 transition-transform duration-300">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-warm-700 transition-colors">
            GidroAtlas
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.filter((i) => !i.isButton).map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-gray-600 hover:text-warm-700 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-[-4px] after:left-0 after:bg-warm-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              {item.label}
            </a>
          ))}

          {!userLogin ? (
            <Button variant="primary" size="sm" onClick={onLoginClick}>
              Войти
            </Button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-warm-100 px-4 py-2 text-sm font-semibold text-gray-800 border border-warm-200 shadow-sm hover:bg-warm-200 transition"
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
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-warm-200 bg-white shadow-lg shadow-warm-200/40 py-2 z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-warm-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onProfile();
                    }}
                  >
                    Профиль
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-warm-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <button
          className="md:hidden text-gray-900 focus:outline-none bg-warm-100 p-2 rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-warm-50/95 backdrop-blur-xl border-b border-warm-200 p-6 md:hidden flex flex-col gap-4 shadow-xl">
          {NAV_ITEMS.map((item) =>
            item.isButton ? (
              <Button
                key={item.label}
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </Button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-base font-medium text-gray-700 py-3 border-b border-warm-200/50 hover:text-warm-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      )}
    </header>
  );
};
