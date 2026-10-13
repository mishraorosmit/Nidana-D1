import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, ArrowUpRight, Eye, FlaskConical, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AnswerOption } from '../components/AnswerOption';
import { ScreenId, NavDestination } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface WhyEngineScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onNavigateNav: (dest: NavDestination) => void;
  onRepairCompleted?: (xp: number, marks: number) => void;
}

type RepairPhase = 'evidence' | 'bridge-learning' | 'followup-question' | 'recovered';

export const WhyEngineScreen: React.FC<WhyEngineScreenProps> = ({
  onNavigateNav,
  onRepairCompleted,
}) => {
  const { t, languageMode } = useLanguage();
  const [phase, setPhase] = useState<RepairPhase>('evidence');
  const [selectedFollowupOption, setSelectedFollowupOption] = useState<string | null>(null);
  const [followupSubmitted, setFollowupSubmitted] = useState<boolean>(false);
  const [followupError, setFollowupError] = useState<boolean>(false);

  const followupQuestion = {
    text: 'Follow-up verification: When light passes from air into a glass prism and bends towards the normal, which term describes this phenomenon?',
    textOdia: 'ଅନୁବର୍ତ୍ତୀ ଯାଞ୍ଚ: ଆଲୋକ ବାୟୁରୁ କାଚ ପ୍ରିଜିମ ମଧ୍ୟକୁ ଗତି କରି ବଙ୍କା ହେବା ପ୍ରକ୍ରିୟାକୁ କ’ଣ କୁହାଯାଏ?',
    options: [
      { id: 'A', text: 'Reflection · ପ୍ରତିଫଳନ' },
      { id: 'B', text: 'Refraction · ପ୍ରତିସରଣ' },
      { id: 'C', text: 'Dispersion · ବିଚ୍ଛୁରଣ' },
      { id: 'D', text: 'Absorption · ଶୋଷଣ' },
    ],
    correctId: 'B',
  };

  const handleStartRepair = () => {
    setPhase('bridge-learning');
  };

  const handleProceedToFollowup = () => {
    setPhase('followup-question');
    setSelectedFollowupOption(null);
    setFollowupSubmitted(false);
    setFollowupError(false);
  };

  const handleSubmitFollowup = () => {
    if (!selectedFollowupOption) return;
    setFollowupSubmitted(true);
    if (selectedFollowupOption === followupQuestion.correctId) {
      setFollowupError(false);
      setPhase('recovered');
      if (onRepairCompleted) {
        onRepairCompleted(25, 4);
      }
    } else {
      setFollowupError(true);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      <div className="flex items-center justify-between gap-2 pt-1 pb-1">
        <div className="text-xs font-semibold text-[#2A5C8A] bg-[#E7EFF7] px-2.5 py-1 rounded-full border border-[#2A5C8A]/20 font-ui">
          {t.whyEngineTraceTag}
        </div>

        <div className="text-xs text-[#6B6A67] font-mono">
          Deterministic Probe #OPT-402
        </div>
      </div>

      <div>
        <h1 className="font-serif-display text-2xl font-semibold text-[#191817] leading-tight break-words">
          {t.whyTitle}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold text-[#0E7C7B] bg-[#E3F2F1] px-2.5 py-0.5 rounded-full border border-[#0E7C7B]/20">
            {t.whyContext}
          </span>
          <span className="text-xs text-[#6B6A67]">
            {t.avoidableLossNotice}
          </span>
        </div>
      </div>

      {phase === 'evidence' && (
        <div className="space-y-3 pt-1">
          
          <div className="relative">
            <Card variant="soft-blue" className="p-4 border border-[#2A5C8A]/20">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2A5C8A] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 text-[#2A5C8A]">
                    <Eye className="w-4 h-4" />
                    <h2 className="font-ui font-semibold text-sm text-[#191817]">
                      {t.noticedTitle}
                    </h2>
                  </div>
                  <p className="text-[14px] text-[#191817] leading-relaxed break-words font-ui">
                    {t.noticedContent}
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="w-0.5 h-3 bg-[#E4E0D8] mx-auto" aria-hidden="true" />
          </div>

          <div className="relative">
            <Card variant="soft-blue" className="p-4 border border-[#2A5C8A]/20">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2A5C8A] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 text-[#2A5C8A]">
                    <FlaskConical className="w-4 h-4" />
                    <h2 className="font-ui font-semibold text-sm text-[#191817]">
                      {t.testedTitle}
                    </h2>
                  </div>
                  <p className="text-[14px] text-[#191817] leading-relaxed break-words font-ui">
                    {t.testedContent}
                  </p>
                </div>
              </div>
            </Card>
            <div className="w-0.5 h-3 bg-[#E4E0D8] mx-auto" aria-hidden="true" />
          </div>

          <div className="relative">
            <Card variant="soft-green" className="p-4 border border-[#2F7D4F]/30">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2F7D4F] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-[#2F7D4F]">
                      <CheckCircle2 className="w-4 h-4" />
                      <h2 className="font-ui font-semibold text-sm text-[#191817]">
                        {t.probeResultTitle}
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold bg-[#2F7D4F] text-white px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-[14px] text-[#191817] leading-relaxed break-words font-ui">
                    {t.probeResultContent}
                  </p>
                </div>
              </div>
            </Card>
            <div className="w-0.5 h-3 bg-[#E4E0D8] mx-auto" aria-hidden="true" />
          </div>

          <div className="relative">
            <Card variant="soft-blue" className="p-4 border border-[#2A5C8A]/20">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2A5C8A] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 text-[#2A5C8A]">
                    <AlertCircle className="w-4 h-4" />
                    <h2 className="font-ui font-semibold text-sm text-[#191817]">
                      {t.causeTitle}
                    </h2>
                  </div>
                  <p className="text-[14px] text-[#191817] leading-relaxed break-words font-ui">
                    {t.causeContent}
                  </p>
                </div>
              </div>
            </Card>
            <div className="w-0.5 h-3 bg-[#E4E0D8] mx-auto" aria-hidden="true" />
          </div>

          <Card variant="soft-blue" className="p-4 border border-[#2A5C8A]/20">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#2A5C8A] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                5
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 text-[#2A5C8A]">
                  <ArrowUpRight className="w-4 h-4" />
                  <h2 className="font-ui font-semibold text-sm text-[#191817]">
                    {t.meansTitle}
                  </h2>
                </div>
                <p className="text-[14px] text-[#191817] leading-relaxed break-words font-ui">
                  {t.meansContent}
                </p>
                <span className="text-[11px] text-[#6B6A67] mt-1 block">
                  (Estimated based on probe test response time and accuracy)
                </span>
              </div>
            </div>
          </Card>

          <div className="pt-2">
            <Button
              fullWidth
              size="lg"
              onClick={handleStartRepair}
              className="text-base font-semibold shadow-xs"
            >
              <span>{t.repairGapBtn}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {phase === 'bridge-learning' && (
        <Card variant="default" className="p-5 border border-[#E4E0D8] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-[#0E7C7B]">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider font-ui">
              Language Bridge · Step 1 of 2
            </span>
          </div>

          <h2 className="font-serif-display text-xl font-bold text-[#191817]">
            English–Odia Terminology Bridge
          </h2>

          <p className="text-xs text-[#6B6A67] leading-relaxed">
            Exam papers frequently use English technical words that sound similar. Notice the direct mapping:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#E3F2F1] rounded-[14px] border border-[#0E7C7B]/20">
              <div className="flex items-center justify-between">
                <span className="font-ui font-bold text-[#191817] text-sm">Refraction</span>
                <span className="font-odia font-semibold text-[#0E7C7B] text-sm">ପ୍ରତିସରଣ</span>
              </div>
              <p className="text-xs text-[#191817]/80 mt-1">
                Light bending when passing from one medium to another (e.g. air into water/glass).
              </p>
            </div>

            <div className="p-3 bg-[#F7F5F0] rounded-[14px] border border-[#E4E0D8]">
              <div className="flex items-center justify-between">
                <span className="font-ui font-bold text-[#191817] text-sm">Reflection</span>
                <span className="font-odia font-semibold text-[#6B6A67] text-sm">ପ୍ରତିଫଳନ</span>
              </div>
              <p className="text-xs text-[#6B6A67] mt-1">
                Light bouncing back from a smooth or mirrored boundary surface.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              fullWidth
              size="lg"
              onClick={handleProceedToFollowup}
              className="text-base font-semibold"
            >
              <span>Take follow-up verification question</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {phase === 'followup-question' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-[#FFF4D6] rounded-[14px] border border-[#D99A2B]/30 text-xs text-[#A66F0D] flex items-center justify-between">
            <span>Follow-up verification check · Solve to confirm recovery</span>
            <span className="font-mono font-bold">+4 Marks</span>
          </div>

          <Card className="p-5 border border-[#E4E0D8]">
            <h2 className="text-[16px] font-ui font-medium text-[#191817] leading-relaxed break-words">
              {followupQuestion.text}
            </h2>
            <p className="text-xs text-[#6B6A67] font-odia mt-2 pt-2 border-t border-[#E4E0D8] leading-relaxed break-words">
              {followupQuestion.textOdia}
            </p>
          </Card>

          <div className="space-y-2.5">
            {followupQuestion.options.map((opt) => (
              <AnswerOption
                key={opt.id}
                letter={opt.id}
                text={opt.text}
                isSelected={selectedFollowupOption === opt.id}
                isSubmitted={followupSubmitted}
                isCorrect={opt.id === followupQuestion.correctId}
                disabled={followupSubmitted && !followupError}
                onClick={() => {
                  setSelectedFollowupOption(opt.id);
                  setFollowupError(false);
                }}
              />
            ))}
          </div>

          {followupError && (
            <div className="p-3 bg-[#FBE8E5] text-[#B3402F] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Remember: Light bending across mediums is Refraction (ପ୍ରତିସରଣ). Try selecting B.</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              fullWidth
              size="lg"
              disabled={!selectedFollowupOption}
              onClick={handleSubmitFollowup}
              className="text-base font-semibold"
            >
              Verify follow-up answer
            </Button>
          </div>
        </div>
      )}

      {phase === 'recovered' && (
        <Card variant="soft-green" className="p-6 border border-[#2F7D4F]/30 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#2F7D4F] text-white flex items-center justify-center shadow-xs">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2F7D4F] font-ui">
              Weakness Verified & Recovered
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-[#191817] mt-1 break-words">
              Refraction Weakness Recovered!
            </h2>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-white rounded-full border border-[#2F7D4F]/30 text-xs font-mono font-bold text-[#2F7D4F]">
              <span>+4 Marks Recovered</span>
              <span>·</span>
              <span>+25 XP Earned</span>
            </div>
            <p className="text-xs text-[#6B6A67] mt-3 leading-relaxed max-w-xs mx-auto break-words">
              Follow-up question answered correctly. You verified that English terminology friction is cleared and your concept map has been updated.
            </p>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <Button
              size="lg"
              fullWidth
              onClick={() => onNavigateNav('map')}
              className="bg-[#2F7D4F] hover:bg-[#25633e] text-base"
            >
              <span>See updated Learning Map</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="default"
              fullWidth
              onClick={() => onNavigateNav('plan')}
            >
              <span>View updated Study Plan</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              size="default"
              fullWidth
              onClick={() => onNavigateNav('home')}
            >
              Return to Home
            </Button>
          </div>
        </Card>
      )}

      <div className="p-3.5 bg-[#F7F5F0] rounded-[14px] border border-[#E4E0D8] text-[11px] text-[#6B6A67] leading-relaxed flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0E7C7B] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#191817]">Scientific evidence model:</strong> NIDANA does not use conversational hallucinations. Mark loss is confirmed by measuring hesitation time, running language probes, and verifying retention through a follow-up test.
        </span>
      </div>
    </div>
  );
};
