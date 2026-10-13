import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  metricLabel?: string;
  color?: 'brand' | 'gold' | 'teal' | 'green' | 'gradient';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  metricLabel,
  color = 'brand',
  size = 'default',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    default: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const colorClasses = {
    brand: 'bg-[#C96442]',
    gold: 'bg-[#D99A2B]',
    teal: 'bg-[#0E7C7B]',
    green: 'bg-[#2F7D4F]',
    gradient: 'bg-gradient-to-r from-[#C96442] to-[#D99A2B]',
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {(label || metricLabel) && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-[#6B6A67]">
          {label && <span className="font-medium text-[#191817]">{label}</span>}
          {metricLabel ? (
            <span className="font-mono tabular-nums">{metricLabel}</span>
          ) : (
            <span className="font-mono tabular-nums">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-[#E4E0D8] rounded-full overflow-hidden ${sizeClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorClasses}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
