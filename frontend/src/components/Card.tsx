import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'soft-brand' | 'soft-teal' | 'soft-gold' | 'soft-blue' | 'soft-green';
  padding?: 'none' | 'sm' | 'default' | 'lg';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'default',
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'rounded-[20px] transition-all duration-150 relative overflow-hidden';

  const paddingClasses = {
    none: '',
    sm: 'p-3.5',
    default: 'p-5',
    lg: 'p-6',
  }[padding];

  const variantClasses = {
    default: 'bg-white border border-[#E4E0D8] shadow-[0_10px_24px_rgba(25,24,23,0.06)]',
    'soft-brand': 'bg-[#FBEAE3] border border-[#C96442]/20',
    'soft-teal': 'bg-[#E3F2F1] border border-[#0E7C7B]/20',
    'soft-gold': 'bg-[#FFF4D6] border border-[#D99A2B]/30',
    'soft-blue': 'bg-[#E7EFF7] border border-[#2A5C8A]/20',
    'soft-green': 'bg-[#E5F3E9] border border-[#2F7D4F]/20',
  }[variant];

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-[#C96442]/40 hover:shadow-[0_12px_28px_rgba(25,24,23,0.1)] active:scale-[0.99]'
    : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${variantClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
