import React from 'react';
import type { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warm-400 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-warm-400 text-gray-900 hover:bg-warm-500 hover:scale-105 shadow-lg shadow-warm-500/30',
    secondary: 'bg-white text-gray-900 hover:bg-warm-50 border border-warm-200 shadow-sm',
    outline: 'border-2 border-warm-900 text-warm-900 hover:bg-warm-900 hover:text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
