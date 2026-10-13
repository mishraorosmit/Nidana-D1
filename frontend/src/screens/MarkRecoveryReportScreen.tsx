import React from 'react';
import { Trophy, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { sampleRecoveryReportData } from '../data/mockData';
import { ScreenId, NavDestination } from '../types';

interface MarkRecoveryReportScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onNavigateNav: (dest: NavDestination) => void;
}

export const MarkRecoveryReportScreen: React.FC<MarkRecoveryReportScreenProps> = ({
  onNavigate,
  onNavigateNav,
}) => {
  const data = sampleRecoveryReportData;

  const handleStartRecoveryPlan = () => {
    onNavigateNav('plan');
  };

  return (
    <div className="space-y-4 pb-10">
      
      <header className="pt-2">
        <h1 className="font-serif-display text-2xl font-semibold text-[#191817] leading-tight">
          Mark Recovery Report
        </h1>
        <p className="text-[14px] text-[#6B6A67] font-ui mt-0.5">
          {data.subtitle}
        </p>
      </header>

      <Card
        variant="soft-gold"
        className="p-5 border border-[#D99A2B]/40 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A66F0D] font-ui">
              Verified Recovery Potential
            </span>
            <div className="font-serif-display text-[28px] sm:text-[32px] font-bold text-[#191817] mt-1 leading-tight">
              19 marks recoverable
            </div>
            <p className="text-xs text-[#6B6A67] mt-1 font-mono">
              Avoidable loss identified across 3 targeted areas
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/90 border border-[#D99A2B]/30 flex items-center justify-center text-[#D99A2B] shrink-0 shadow-xs">
            <Trophy className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-white/90 rounded-[14px] border border-[#D99A2B]/20">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2F7D4F] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs font-ui text-[#191817] leading-relaxed">
              <strong className="font-semibold text-[#191817]">Reassurance: </strong>
              {data.reassurance}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-1">
        <h2 className="font-ui font-semibold text-[17px] text-[#191817]">
          Verified causes of lost marks
        </h2>
        <span className="text-xs text-[#6B6A67]">Evidence tested</span>
      </div>

      <section className="space-y-3" aria-label="Causes of lost marks">
        
        <Card
          variant="default"
          className="p-4 sm:p-5 border border-[#E4E0D8] hover:border-[#0E7C7B]/40 transition-colors shadow-2xs"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F7F5F0] text-[#191817] border border-[#E4E0D8] text-xs font-mono font-semibold flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="font-ui font-semibold text-[15px] sm:text-[16px] text-[#191817]">
                English terminology friction
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5F3E9] text-[#2F7D4F] font-mono font-bold shrink-0 border border-[#2F7D4F]/20">
              8 marks recoverable
            </span>
          </div>

          <div className="ml-7 space-y-2">
            <p className="text-xs text-[#6B6A67] leading-relaxed">
              <span className="font-semibold text-[#191817]">8 marks recoverable. </span>
              You answered correctly after the Odia term bridge.
            </p>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E4E0D8]/60 text-xs">
              <span className="text-[#0E7C7B] font-medium flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Refraction terminology bridge
              </span>
              <button
                type="button"
                onClick={() => onNavigate('why-engine')}
                className="text-[#6B6A67] hover:text-[#C96442] font-medium underline cursor-pointer"
              >
                Inspect
              </button>
            </div>
          </div>
        </Card>

        <Card
          variant="default"
          className="p-4 sm:p-5 border border-[#E4E0D8] hover:border-[#D99A2B]/40 transition-colors shadow-2xs"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F7F5F0] text-[#191817] border border-[#E4E0D8] text-xs font-mono font-semibold flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="font-ui font-semibold text-[15px] sm:text-[16px] text-[#191817]">
                Time pressure
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5F3E9] text-[#2F7D4F] font-mono font-bold shrink-0 border border-[#2F7D4F]/20">
              6 marks recoverable
            </span>
          </div>

          <div className="ml-7 space-y-2">
            <p className="text-xs text-[#6B6A67] leading-relaxed">
              <span className="font-semibold text-[#191817]">6 marks recoverable. </span>
              You answered correctly in the untimed retry.
            </p>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E4E0D8]/60 text-xs">
              <span className="text-[#D99A2B] font-medium flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Untimed pacing drill
              </span>
              <button
                type="button"
                onClick={() => onNavigateNav('plan')}
                className="text-[#6B6A67] hover:text-[#C96442] font-medium underline cursor-pointer"
              >
                View in Plan
              </button>
            </div>
          </div>
        </Card>

        <Card
          variant="default"
          className="p-4 sm:p-5 border border-[#E4E0D8] hover:border-[#C96442]/40 transition-colors shadow-2xs"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F7F5F0] text-[#191817] border border-[#E4E0D8] text-xs font-mono font-semibold flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="font-ui font-semibold text-[15px] sm:text-[16px] text-[#191817]">
                Prerequisite gap
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5F3E9] text-[#2F7D4F] font-mono font-bold shrink-0 border border-[#2F7D4F]/20">
              3 marks recoverable
            </span>
          </div>

          <div className="ml-7 space-y-2">
            <p className="text-xs text-[#6B6A67] leading-relaxed">
              <span className="font-semibold text-[#191817]">3 marks recoverable. </span>
              The ratio concept needs a short repair.
            </p>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E4E0D8]/60 text-xs">
              <span className="text-[#C96442] font-medium flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Ratio prerequisite review
              </span>
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="text-[#6B6A67] hover:text-[#C96442] font-medium underline cursor-pointer"
              >
                View Map
              </button>
            </div>
          </div>
        </Card>
      </section>

      <footer className="pt-2 space-y-2.5">
        <Button
          fullWidth
          size="lg"
          onClick={handleStartRecoveryPlan}
          className="text-base font-semibold shadow-xs"
        >
          <span>Start recovery plan</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          variant="ghost"
          fullWidth
          size="default"
          onClick={() => onNavigate('why-engine')}
          className="text-xs text-[#2A5C8A]"
        >
          <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
          <span>See WHY Engine reasoning trace</span>
        </Button>
      </footer>
    </div>
  );
};
