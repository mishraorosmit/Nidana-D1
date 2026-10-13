import React from 'react';
import { Flame, Sparkles, Trophy } from 'lucide-react';

interface XPStreakBadgeProps {
  type?: 'streak' | 'xp' | 'level' | 'tag';
  value: string | number;
  label?: string;
  variant?: 'gold' | 'teal' | 'brand' | 'neutral';
  size?: 'sm' | 'default';
  className?: string;
}

export const XPStreakBadge: React.FC<XPStreakBadgeProps> = ({
  type = 'xp',
  value,
  label,
  variant,
  size = 'default',
  className = '',
}) => {
  const effectiveVariant = variant || (type === 'streak' || type === 'xp' ? 'gold' : type === 'level' ? 'brand' : 'neutral');

  const variantStyles = {
    gold: 'bg-[#FFF4D6] text-[#A66F0D] border border-[#D99A2B]/30',
    teal: 'bg-[#E3F2F1] text-[#0E7C7B] border border-[#0E7C7B]/30',
    brand: 'bg-[#FBEAE3] text-[#A34F33] border border-[#C96442]/30',
    neutral: 'bg-white text-[#6B6A67] border border-[#E4E0D8]',
  }[effectiveVariant];

  const sizeStyles = size === 'sm' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-3 py-1.5 text-xs font-semibold gap-2';

  const renderIcon = () => {
    switch (type) {
      case 'streak':
        return <Flame className="w-3.5 h-3.5 text-[#D99A2B] fill-[#D99A2B]" aria-hidden="true" />;
      case 'xp':
        return <Sparkles className="w-3.5 h-3.5 text-[#D99A2B]" aria-hidden="true" />;
      case 'level':
        return <Trophy className="w-3.5 h-3.5 text-[#C96442]" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-ui tracking-tight whitespace-nowrap shrink-0 ${variantStyles} ${sizeStyles} ${className}`}
    >
      {renderIcon()}
      <span className="font-mono font-medium tabular-nums text-[#191817]">{value}</span>
      {label && <span className="font-normal opacity-90">{label}</span>}
    </div>
  );
};
