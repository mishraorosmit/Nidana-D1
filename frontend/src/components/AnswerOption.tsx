import React from 'react';
import { Check, X } from 'lucide-react';

interface AnswerOptionProps {
  letter: string;
  text: string;
  isSelected: boolean;
  isSubmitted: boolean;
  isCorrect?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  letter,
  text,
  isSelected,
  isSubmitted,
  isCorrect = false,
  onClick,
  disabled = false,
}) => {
  let containerStyles = 'bg-white border-[#E4E0D8] text-[#191817] hover:border-[#C96442]/60';
  let badgeStyles = 'bg-[#F7F5F0] text-[#191817] border border-[#E4E0D8]';
  let statusBadge = null;

  if (isSubmitted) {
    if (isCorrect) {
      containerStyles = 'bg-[#E5F3E9] border-[#2F7D4F] text-[#191817] ring-1.5 ring-[#2F7D4F] animate-calm-fade-in';
      badgeStyles = 'bg-[#2F7D4F] text-white border-[#2F7D4F]';
      statusBadge = (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7D4F] bg-white px-2 py-0.5 rounded-md border border-[#2F7D4F]/30 shrink-0">
          <Check className="w-3.5 h-3.5 animate-check-pop" aria-hidden="true" />
          <span>Correct</span>
        </span>
      );
    } else if (isSelected && !isCorrect) {
      containerStyles = 'bg-[#FBE8E5] border-[#B3402F] text-[#191817] ring-1.5 ring-[#B3402F] animate-calm-fade-in';
      badgeStyles = 'bg-[#B3402F] text-white border-[#B3402F]';
      statusBadge = (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B3402F] bg-white px-2 py-0.5 rounded-md border border-[#B3402F]/30 shrink-0">
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Incorrect</span>
        </span>
      );
    } else {
      containerStyles = 'bg-white/70 border-[#E4E0D8] opacity-65 text-[#6B6A67]';
      badgeStyles = 'bg-[#F7F5F0] text-[#6B6A67] border-[#E4E0D8]';
    }
  } else if (isSelected) {
    containerStyles = 'bg-[#FBEAE3] border-[#C96442] text-[#191817] ring-1.5 ring-[#C96442] shadow-xs scale-[1.005]';
    badgeStyles = 'bg-[#C96442] text-white border-[#C96442]';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`w-full min-h-[56px] p-3.5 rounded-[14px] border transition-all duration-200 ease-out flex items-center justify-between text-left gap-3 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C96442] cursor-pointer disabled:cursor-default ${containerStyles}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-ui font-semibold text-sm shrink-0 transition-colors duration-200 ${badgeStyles}`}
        >
          {letter}
        </span>
        <span className="text-[16px] font-ui leading-snug break-words flex-1">
          {text}
        </span>
      </div>
      {statusBadge}
    </button>
  );
};
