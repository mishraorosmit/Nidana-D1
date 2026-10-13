import React from 'react';
import { Trophy, Sparkles, Check, X } from 'lucide-react';
import { Button } from './Button';

interface RewardPanelProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  xpEarned?: number;
  marksRecovered?: number;
  badgeName?: string;
  onClose: () => void;
  actionLabel?: string;
}

export const RewardPanel: React.FC<RewardPanelProps> = ({
  isOpen,
  title,
  subtitle,
  xpEarned,
  marksRecovered,
  badgeName,
  onClose,
  actionLabel = 'Continue learning',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-calm-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
    >
      <div className="w-full max-w-sm bg-white rounded-[24px] p-6 shadow-2xl border border-[#E4E0D8] text-center relative overflow-hidden animate-calm-fade-in">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#FFF4D6] rounded-full blur-2xl -z-10 opacity-70 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-full text-[#6B6A67] hover:text-[#191817] hover:bg-[#F7F5F0] transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Close reward dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FFF4D6] border border-[#D99A2B]/40 flex items-center justify-center shadow-xs animate-check-pop">
          <Trophy className="w-7 h-7 text-[#D99A2B]" aria-hidden="true" />
        </div>

        <h3 id="reward-modal-title" className="font-serif-display text-2xl font-semibold text-[#191817] mb-1">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-[#6B6A67] mb-4 leading-relaxed font-ui">
            {subtitle}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 my-4">
          {xpEarned !== undefined && xpEarned > 0 && (
            <div className="px-4 py-2 bg-[#FFF4D6] border border-[#D99A2B]/30 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 text-[#A66F0D] font-mono font-bold text-lg tabular-nums">
                <Sparkles className="w-4 h-4 text-[#D99A2B]" aria-hidden="true" />
                +{xpEarned} XP
              </div>
              <span className="text-[11px] text-[#6B6A67]">Earned</span>
            </div>
          )}

          {marksRecovered !== undefined && marksRecovered > 0 && (
            <div className="px-4 py-2 bg-[#E5F3E9] border border-[#2F7D4F]/30 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 text-[#2F7D4F] font-mono font-bold text-lg tabular-nums">
                <Check className="w-4 h-4 text-[#2F7D4F]" aria-hidden="true" />
                +{marksRecovered} Marks
              </div>
              <span className="text-[11px] text-[#6B6A67]">Recovered</span>
            </div>
          )}
        </div>

        {badgeName && (
          <div className="text-xs bg-[#E3F2F1] text-[#0E7C7B] px-3 py-1.5 rounded-full font-medium inline-block mb-4 border border-[#0E7C7B]/30">
            Badge: {badgeName}
          </div>
        )}

        <p className="text-[11px] text-[#6B6A67] mb-4">
          Next: Progress has been reflected in your Concept Map and Study Plan.
        </p>

        <div>
          <Button fullWidth size="lg" onClick={onClose} className="min-h-[48px] text-base font-semibold">
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
