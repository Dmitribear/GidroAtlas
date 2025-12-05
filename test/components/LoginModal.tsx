import React from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
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
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email адрес</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-warm-400 focus:ring-4 focus:ring-warm-100 outline-none transition-all"
                placeholder="name@company.com" 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-gray-700">Пароль</label>
                 <a href="#" className="text-xs text-warm-600 hover:underline">Забыли пароль?</a>
              </div>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-warm-400 focus:ring-4 focus:ring-warm-100 outline-none transition-all"
                placeholder="••••••••" 
              />
            </div>

            <button className="w-full bg-warm-400 text-gray-900 font-bold py-3.5 rounded-xl hover:bg-warm-500 transition-all shadow-lg shadow-warm-400/20 transform hover:-translate-y-0.5">
              Войти в систему
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта? <a href="#" className="text-warm-600 font-semibold hover:underline">Регистрация</a>
          </div>
        </div>
      </div>
    </div>
  );
};