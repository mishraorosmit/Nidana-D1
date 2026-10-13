import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'teal';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 
    'inline-flex items-center justify-center font-ui font-medium tracking-tight rounded-full transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]';

  const sizeClasses = {
    sm: 'min-h-[40px] px-4 py-2 text-xs',
    default: 'min-h-[48px] px-6 py-3 text-sm',
    lg: 'min-h-[52px] px-8 py-3.5 text-base',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#C96442] hover:bg-[#A34F33] text-white shadow-sm focus-visible:outline-[#C96442]',
    secondary:
      'bg-transparent border-[1.5px] border-[#C96442] text-[#C96442] hover:bg-[#FBEAE3] focus-visible:outline-[#C96442]',
    ghost:
      'bg-[#F7F5F0] hover:bg-[#E4E0D8]/50 text-[#191817] border border-[#E4E0D8] focus-visible:outline-[#6B6A67]',
    teal:
      'bg-[#0E7C7B] hover:bg-[#0b6362] text-white shadow-sm focus-visible:outline-[#0E7C7B]',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
