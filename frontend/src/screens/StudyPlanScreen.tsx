import React, { useState } from 'react';
import { Clock, Check, ArrowRight, Play, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Quest, ScreenId } from '../types';

interface StudyPlanScreenProps {
  onNavigate: (screen: ScreenId) => void;
  quests: Quest[];
  onCompleteQuest: (questId: string, xp: number) => void;
}

export const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({
  onNavigate,
  quests,
  onCompleteQuest,
}) => {
  const [activeQuestId, setActiveQuestId] = useState<string>('quest-1');

  const completedCount = quests.filter((q) => q.isCompleted).length;

  const handleStartQuest = (quest: Quest) => {
    setActiveQuestId(quest.id);
    if (quest.type === 'bridge' || quest.type === 'recovery-check') {
      onNavigate('why-engine');
    } else {
      onNavigate('mock-test');
    }
  };

  const handleStartFirstQuest = () => {
    setActiveQuestId('quest-1');
    onNavigate('why-engine');
  };

  return (
    <div className="space-y-4 pb-12">
      
      <header className="pt-2">
        <h1 className="font-serif-display text-2xl font-semibold text-[#191817] leading-tight">
          Today’s quests
        </h1>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B6A67]">
          <span>3 short tasks · about 22 minutes</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#2F7D4F] font-mono">
            {completedCount}/3 completed
          </span>
        </div>
      </header>

      <section className="space-y-3 pt-1" aria-label="Daily quests list">
        {quests.map((quest) => {
          const isActive = activeQuestId === quest.id && !quest.isCompleted;

          return (
            <Card
              key={quest.id}
              variant={quest.isCompleted ? 'soft-green' : 'default'}
              className={`p-4 sm:p-5 border transition-all ${
                quest.isCompleted
                  ? 'border-[#2F7D4F]/30 opacity-90'
                  : isActive
                  ? 'border-[#C96442] ring-1 ring-[#C96442] shadow-xs'
                  : 'border-[#E4E0D8] hover:border-[#C96442]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      quest.isCompleted
                        ? 'bg-[#2F7D4F] text-white'
                        : isActive
                        ? 'border-2 border-[#C96442] text-[#C96442]'
                        : 'border border-[#E4E0D8] text-transparent'
                    }`}
                  >
                    {quest.isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#C96442]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        className={`font-ui font-semibold text-[16px] leading-snug break-words ${
                          quest.isCompleted ? 'line-through text-[#6B6A67]' : 'text-[#191817]'
                        }`}
                      >
                        {quest.title}
                      </h2>
                      {isActive && !quest.isCompleted && (
                        <span className="text-[10px] font-semibold bg-[#FBEAE3] text-[#C96442] px-2 py-0.5 rounded-full border border-[#C96442]/30 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#6B6A67] flex items-center gap-2 mt-1">
                      <span>{quest.durationMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#0E7C7B] font-mono font-medium">
                        +{quest.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-9 mt-2 p-2.5 bg-[#F7F5F0] rounded-[12px] border border-[#E4E0D8]/70 text-xs text-[#6B6A67] leading-relaxed">
                <strong className="text-[#191817]">Why: </strong>
                {quest.whyReason}
              </div>

              <div className="ml-9 mt-3 flex items-center justify-between">
                {!quest.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleStartQuest(quest)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96442] hover:text-[#A34F33] py-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isActive ? 'Continue quest' : 'Start quest'}</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#2F7D4F] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                )}

                {!quest.isCompleted && (
                  <button
                    type="button"
                    onClick={() => onCompleteQuest(quest.id, quest.xpReward)}
                    className="text-xs text-[#6B6A67] hover:text-[#191817] underline cursor-pointer"
                  >
                    Quick mark
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </section>

      <div className="pt-2">
        <Button
          fullWidth
          size="lg"
          onClick={handleStartFirstQuest}
          className="text-base font-semibold shadow-xs"
        >
          <span>Start first quest</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="p-3.5 bg-[#F7F5F0] rounded-[14px] border border-[#E4E0D8] text-xs text-[#6B6A67] leading-relaxed">
        <span className="font-semibold text-[#191817]">Short, targeted bursts:</span> Tasks take 5–10 minutes each and explain the exact reason for practice, avoiding massive calendar backlogs.
      </div>
    </div>
  );
};
