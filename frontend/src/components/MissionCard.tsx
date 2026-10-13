import React from 'react';
import { Compass, BookOpen, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { MissionData } from '../types';

interface MissionCardProps {
  mission: MissionData;
  onSelect: (mission: MissionData) => void;
  status?: 'available' | 'active' | 'completed';
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onSelect,
}) => {
  const getIcon = () => {
    switch (mission.type) {
      case 'diagnostic':
        return <Compass className="w-5 h-5 text-[#C96442]" />;
      case 'bridge':
        return <BookOpen className="w-5 h-5 text-[#0E7C7B]" />;
      case 'pacing':
        return <Clock className="w-5 h-5 text-[#D99A2B]" />;
      case 'recovery':
        return <ShieldCheck className="w-5 h-5 text-[#2F7D4F]" />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(mission);
    }
  };

  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      onClick={() => onSelect(mission)}
      onKeyDown={handleKeyDown}
      className="p-4 sm:p-5 group border border-[#E4E0D8] hover:border-[#C96442]/60 focus-visible:outline-2 focus-visible:outline-[#C96442] active:scale-[0.99] select-none cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E4E0D8] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FBEAE3] transition-colors">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-ui font-semibold text-[16px] sm:text-[17px] text-[#191817] group-hover:text-[#C96442] transition-colors leading-snug break-words">
              {mission.title}
            </h3>
            <p className="text-[14px] text-[#6B6A67] mt-1 leading-relaxed break-words font-ui">
              {mission.purpose}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#6B6A67]">
              {mission.effortText ? (
                <>
                  <span className="font-medium text-[#191817]">{mission.effortText}</span>
                  <span aria-hidden="true" className="text-[#E4E0D8]">·</span>
                </>
              ) : null}
              <span className="inline-flex items-center px-2 py-0.5 bg-[#E3F2F1] text-[#0E7C7B] rounded-full font-mono font-medium text-xs border border-[#0E7C7B]/20">
                +{mission.xpReward} XP
              </span>
            </div>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#F7F5F0] flex items-center justify-center shrink-0 self-center text-[#6B6A67] group-hover:text-[#C96442] group-hover:bg-[#FBEAE3] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
};
