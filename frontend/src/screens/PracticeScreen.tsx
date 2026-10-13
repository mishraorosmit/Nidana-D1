import React from 'react';
import { sampleMissions } from '../data/mockData';
import { MissionCard } from '../components/MissionCard';
import { MissionData, ScreenId } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PracticeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectMission?: (mission: MissionData) => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  onNavigate,
  onSelectMission,
}) => {
  const { t } = useLanguage();

  const handleMissionClick = (mission: MissionData) => {
    if (onSelectMission) {
      onSelectMission(mission);
    }
    if (mission.id === 'mission-diagnostic') {
      onNavigate('mock-test');
    } else if (mission.id === 'mission-language-bridge' || mission.id === 'mission-recovery-check') {
      onNavigate('why-engine');
    } else if (mission.id === 'mission-pacing') {
      onNavigate('mock-test');
    } else {
      onNavigate('mock-test');
    }
  };

  return (
    <div className="space-y-4 pb-6">
      
      <div className="pt-2">
        <h1 className="font-serif-display text-2xl font-semibold text-[#191817] leading-tight">
          {t.practiceTitle}
        </h1>
        <p className="text-[14px] text-[#6B6A67] font-ui mt-0.5">
          {t.practiceSubtitle}
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {sampleMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onSelect={handleMissionClick}
          />
        ))}
      </div>

      <div className="p-4 bg-white/70 rounded-[14px] border border-[#E4E0D8] text-xs text-[#6B6A67] leading-relaxed font-ui">
        <span className="font-semibold text-[#191817]">Calm learning game:</span> {t.calmNotice || 'Every mission isolates a specific variable—terminology, speed, or concepts—so you gain clarity without unnecessary exam pressure.'}
      </div>
    </div>
  );
};
