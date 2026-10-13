import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Flame,
  Hourglass,
  Lock,
  ScrollText,
  Target,
} from 'lucide-react';
import { StudentProfile, ScreenId, NavDestination } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HomeScreenProps {
  profile: StudentProfile;
  onNavigate: (screen: ScreenId) => void;
  onNavigateNav: (dest: NavDestination) => void;
  isOfflineMode?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onNavigate,
  onNavigateNav,
}) => {
  const { t, languageMode } = useLanguage();
  const progressPercent = 68;

  const totalRecoverableMarks =
    profile.breakdown.englishTerminology +
    profile.breakdown.timePressure +
    profile.breakdown.conceptGaps;

  const handleStartTodayMission = () => {
    onNavigate('why-engine');
  };

  const stepperRef = React.useRef<HTMLDivElement>(null);
  const [stepperInView, setStepperInView] = React.useState(false);

  React.useEffect(() => {
    const el = stepperRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setStepperInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepperInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-5 pb-6 font-operational text-[#29251F]">
      
      <section
        className="relative w-full rounded-2xl overflow-hidden border border-[#D7C4A5]/70 shadow-xs bg-[#F8F2E7]"
        aria-label="Student Greeting and Recovery Readiness"
      >
        
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <picture>
            <source srcSet="/assets/odyssey/hero-coastal.webp" type="image/webp" />
            <img
              src="/assets/odyssey/hero-coastal.png"
              alt=""
              className="w-full h-full object-cover object-right"
              aria-hidden="true"
            />
          </picture>
          
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#F8F2E7] via-[#F8F2E7]/85 to-[#F8F2E7]/20 sm:via-[#F8F2E7]/75 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between min-h-[155px] sm:min-h-[165px]">
          <div className="max-w-[70%] sm:max-w-[72%] min-w-0">
            <h1 className="font-source-serif text-2xl sm:text-[26px] font-bold text-[#1E1B16] leading-tight break-words drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
              {profile.greetingOdia}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#423C33] font-operational mt-1 leading-snug font-semibold drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
              {languageMode === 'odia'
                ? 'ଆପଣଙ୍କର ପରବର୍ତ୍ତୀ ପୁନରୁଦ୍ଧାର ପ୍ରସ୍ତୁତ।'
                : 'Your next recovery is ready.'}
            </p>
          </div>

          <div className="mt-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF4D6] rounded-full border border-[#D99A2B]/40 text-xs font-semibold text-[#A66F0D] shadow-2xs w-fit">
              <Flame className="w-3.5 h-3.5 text-[#D99A2B] fill-[#D99A2B]" aria-hidden="true" />
              <span className="font-mono tabular-nums text-[#191817]">{profile.streakDays}</span>
              <span>
                {languageMode === 'odia' ? 'ଦିନ ଷ୍ଟ୍ରିକ୍' : 'day streak'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="p-3.5 sm:p-5 rounded-2xl bg-[#F8F2E7] border border-[#D7C4A5]/70 shadow-xs space-y-3.5"
        aria-label="Recovery Points & Level Progress"
      >
        
        <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-[#FFF9ED] to-[#F5E2BE] border border-[#C7974A]/60 flex items-center justify-center text-[#C7974A] shrink-0 shadow-2xs">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#C7974A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <circle cx="12" cy="12" r="9" strokeWidth="1.4" />
                <circle cx="12" cy="12" r="7" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                <path d="M12 7 L13.5 10.5 L17 12 L13.5 13.5 L12 17 L10.5 13.5 L7 12 L10.5 10.5 Z" fill="#C7974A" fillOpacity="0.35" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="1.5" fill="#C7974A" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-operational uppercase tracking-wider text-[#6D675E] font-medium block leading-none mb-1">
                {t.recoveryPoints}
              </span>
              <div className="font-source-serif font-bold text-xl sm:text-2xl text-[#29251F] leading-none truncate">
                {profile.currentXp} XP
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-xs font-semibold text-[#A4482E] bg-[#FBEAE3] px-2.5 sm:px-3 py-1 rounded-full border border-[#C45C38]/25 shadow-2xs inline-block whitespace-nowrap">
              {t.levelTitle || 'Level 4: Mark Detective'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs font-operational font-medium gap-2">
            <span className="text-[#6D675E] shrink-0">
              {languageMode === 'odia' ? 'ସ୍ତର ଅଗ୍ରଗତି' : 'Level progress'}
            </span>
            <span className="text-[#A4482E] font-semibold text-right truncate">
              {languageMode === 'odia'
                ? `ଲେଭଲ୍ ୫ ପାଇଁ ${profile.nextLevelXp - profile.currentXp} XP ବାକି`
                : `${profile.nextLevelXp - profile.currentXp} XP to Level 5`}
            </span>
          </div>

          <div className="w-full h-2 bg-[#EFE5D5] rounded-full overflow-hidden border border-[#D7C4A5]/40">
            <div
              className="h-full bg-gradient-to-r from-[#C45C38] via-[#D99A2B] to-[#C7974A] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </section>

      <section
        className="p-3.5 sm:p-5 rounded-2xl bg-[#F8F2E7] border border-[#D7C4A5]/70 shadow-xs relative overflow-hidden space-y-3.5"
        aria-label="Avoidable Mark Loss Diagnostics"
      >
        
        <div
          className="absolute right-0 bottom-0 h-28 w-20 pointer-events-none opacity-10 select-none overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="/assets/odyssey/pillar-etching.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10">
          
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#A4482E] font-operational">
              {languageMode === 'odia' ? 'ସୁଯୋଗ ଚିହ୍ନଟ (AVOIDABLE LOSS)' : 'AVOIDABLE LOSS'}
            </span>
            <span className="text-xs bg-[#FAF6EE] text-[#A4482E] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#D7C4A5]/80 shadow-2xs shrink-0">
              {totalRecoverableMarks} Marks
            </span>
          </div>

          <h2 className="font-source-serif text-xl sm:text-[22px] font-bold text-[#29251F] leading-snug break-words">
            {languageMode === 'odia'
              ? `${totalRecoverableMarks} ମାର୍କ ପୁନରୁଦ୍ଧାର ଯୋଗ୍ୟ`
              : `${totalRecoverableMarks} marks are recoverable`}
          </h2>

          <p className="text-xs sm:text-[13px] text-[#6D675E] mt-1 leading-relaxed font-operational break-words font-medium">
            {languageMode === 'odia'
              ? t.recoverableMarksBreakdown
              : `${profile.breakdown.englishTerminology} from English terminology, ${profile.breakdown.timePressure} from time pressure, and ${profile.breakdown.conceptGaps} from concept gaps.`}
          </p>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mt-3.5 text-center">
            
            <div className="bg-[#FAF6EE] rounded-xl p-2 sm:p-2.5 border border-[#D7C4A5]/70 shadow-2xs flex flex-col items-center justify-between h-full min-h-[88px] sm:min-h-[92px] transition-transform hover:-translate-y-0.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#E8EFF0] border border-[#C6D8D9] flex items-center justify-center text-[#0E7C7B] mb-1 shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="font-source-serif font-bold text-[#0E7C7B] text-sm sm:text-base leading-tight">
                +{profile.breakdown.englishTerminology}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#6D675E] font-medium truncate w-full mt-0.5">
                {t.terminologyLoss}
              </div>
            </div>

            <div className="bg-[#FAF6EE] rounded-xl p-2 sm:p-2.5 border border-[#D7C4A5]/70 shadow-2xs flex flex-col items-center justify-between h-full min-h-[88px] sm:min-h-[92px] transition-transform hover:-translate-y-0.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FFF4D6] border border-[#E8D7B8] flex items-center justify-center text-[#C7974A] mb-1 shrink-0">
                <Hourglass className="w-3.5 h-3.5" />
              </div>
              <div className="font-source-serif font-bold text-[#C7974A] text-sm sm:text-base leading-tight">
                +{profile.breakdown.timePressure}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#6D675E] font-medium truncate w-full mt-0.5">
                {t.pacingLoss}
              </div>
            </div>

            <div className="bg-[#FAF6EE] rounded-xl p-2 sm:p-2.5 border border-[#D7C4A5]/70 shadow-2xs flex flex-col items-center justify-between h-full min-h-[88px] sm:min-h-[92px] transition-transform hover:-translate-y-0.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FBEAE3] border border-[#ECCDC2] flex items-center justify-center text-[#C45C38] mb-1 shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div className="font-source-serif font-bold text-[#C45C38] text-sm sm:text-base leading-tight">
                +{profile.breakdown.conceptGaps}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#6D675E] font-medium truncate w-full mt-0.5">
                {t.conceptLoss}
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 flex items-center justify-end border-t border-[#D7C4A5]/40">
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="text-xs font-semibold text-[#C45C38] hover:text-[#A4482E] inline-flex items-center gap-1 cursor-pointer transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-[#C45C38]"
            >
              <span>{t.viewReportLink || 'View detailed recovery report'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      <section
        className="p-3.5 sm:p-5 rounded-2xl bg-[#F8F2E7] border border-[#D7C4A5]/70 shadow-xs relative overflow-hidden space-y-4"
        aria-label="Today's Mission Card"
      >
        
        <div
          className="absolute inset-0 pointer-events-none opacity-15 select-none overflow-hidden"
          aria-hidden="true"
        >
          <picture>
            <source srcSet="/assets/odyssey/mission-map-full.webp" type="image/webp" />
            <img
              src="/assets/odyssey/mission-map-full.png"
              alt=""
              className="w-full h-full object-cover object-center"
              aria-hidden="true"
            />
          </picture>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-source-serif font-bold text-lg sm:text-xl text-[#344F5D] leading-tight truncate">
              {t.todaysMissionTag || "Today's Mission"}
            </h3>
            <p className="text-xs text-[#6D675E] mt-0.5 font-medium">
              Continue your recovery journey
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="text-xs text-[#6D675E] flex items-center gap-1 font-medium bg-[#FAF6EE] px-2 py-0.5 rounded-full border border-[#D7C4A5]/60 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#C45C38]" />
              10 min
            </span>
            <span className="px-2.5 py-0.5 bg-[#E8EFF0] text-[#0E7C7B] rounded-full font-mono font-bold text-xs border border-[#0E7C7B]/25 shadow-2xs">
              +25 XP
            </span>
          </div>
        </div>

        <div ref={stepperRef} className="relative z-10 py-1.5 px-0.5">
          
          <div
            className={`absolute top-[20px] sm:top-[22px] left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-[#C45C38]/50 z-0 pointer-events-none transition-opacity duration-500 ease-out ${
              stepperInView ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          <div className="grid grid-cols-4 gap-1 relative z-10">
            
            <div
              className={`flex flex-col items-center transition-all ${
                stepperInView ? 'animate-checkpoint-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '0ms' }}
            >
              <button
                type="button"
                onClick={() => onNavigateNav('practice')}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF5ED] border-2 border-[#0E7C7B] flex items-center justify-center text-[#0E7C7B] shadow-2xs relative cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Practice (Completed) - Click to review"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#2F7D4F] text-white flex items-center justify-center text-[8px] sm:text-[9px] font-bold shadow-2xs ring-1 ring-white">
                  <Check className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[3]" />
                </span>
              </button>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#0E7C7B] leading-tight text-center mt-1.5 px-0.5 truncate w-full">
                Practice
              </span>
            </div>

            <div
              className={`flex flex-col items-center transition-all ${
                stepperInView ? 'animate-checkpoint-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '90ms' }}
            >
              <button
                type="button"
                onClick={handleStartTodayMission}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FBEAE3] border-2 border-[#C45C38] ring-3 sm:ring-4 ring-[#C45C38]/25 flex items-center justify-center text-[#C45C38] shadow-xs relative cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Mini Test (Current) - Click to start"
              >
                <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#C45C38] ring-2 ring-white animate-pulse" />
              </button>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#C45C38] leading-tight text-center mt-1.5 px-0.5 truncate w-full">
                Mini Test
              </span>
            </div>

            <div
              className={`flex flex-col items-center transition-all ${
                stepperInView ? 'animate-checkpoint-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '180ms' }}
            >
              <button
                type="button"
                onClick={() => onNavigateNav('map')}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF5ED] border border-[#D7C4A5] flex items-center justify-center text-[#6D675E] shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Explore Concepts - Click to view Concept Map"
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#6D675E] leading-tight text-center mt-1.5 px-0.5 truncate w-full">
                Concepts
              </span>
            </div>

            <div
              className={`flex flex-col items-center transition-all ${
                stepperInView ? 'animate-checkpoint-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '270ms' }}
            >
              <button
                type="button"
                onClick={() => onNavigateNav('plan')}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EFE7D8]/80 border border-[#D7C4A5] flex items-center justify-center text-[#6D675E]/60 shadow-2xs relative cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Recover Marks (Study Plan)"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 9 L12 3 L21 9" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="5" y1="11" x2="5" y2="19" />
                  <line x1="9" y1="11" x2="9" y2="19" />
                  <line x1="15" y1="11" x2="15" y2="19" />
                  <line x1="19" y1="11" x2="19" y2="19" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#D7C4A5] text-[#6D675E] flex items-center justify-center ring-1 ring-white">
                  <Lock className="w-1.5 sm:w-2 h-1.5 sm:h-2" />
                </span>
              </button>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#6D675E]/70 leading-tight text-center mt-1.5 px-0.5 truncate w-full">
                Recover
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-3.5">
          <p className="text-xs text-[#6D675E] leading-relaxed font-medium">
            {t.todaysMissionDesc}
          </p>

          <button
            type="button"
            onClick={handleStartTodayMission}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-[#C45C38] hover:bg-[#A4482E] text-[#F8F2E7] font-operational font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99] touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C45C38]"
          >
            <span>{t.startMissionBtn || "Start today’s mission"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="space-y-2.5 pt-1" aria-label="Expedition Tools">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D675E] font-operational">
            {languageMode === 'odia' ? 'ଅଭିଯାନ ସାଧନ (Expedition Tools)' : 'EXPEDITION TOOLS'}
          </span>
          <span className="text-[11px] text-[#A4482E] font-medium font-operational">
            3 Ready
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          
          <button
            type="button"
            onClick={() => onNavigate('mock-test')}
            className="p-2.5 rounded-xl bg-[#F8F2E7] border border-[#D7C4A5]/70 hover:border-[#C45C38]/60 hover:bg-[#FAF5ED] shadow-2xs flex flex-col items-center text-center transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FBEAE3] border border-[#ECCDC2] flex items-center justify-center text-[#C45C38] mb-1.5 group-hover:scale-105 transition-transform">
              <ScrollText className="w-4 h-4" />
            </div>
            <span className="font-source-serif font-bold text-xs text-[#29251F] leading-tight block truncate w-full">
              {languageMode === 'odia' ? 'ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ମକ୍' : 'Diagnostic Mock'}
            </span>
            <span className="text-[10px] text-[#6D675E] mt-0.5">
              4 marks · 8 min
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateNav('map')}
            className="p-2.5 rounded-xl bg-[#F8F2E7] border border-[#D7C4A5]/70 hover:border-[#0E7C7B]/60 hover:bg-[#FAF5ED] shadow-2xs flex flex-col items-center text-center transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8EFF0] border border-[#C6D8D9] flex items-center justify-center text-[#0E7C7B] mb-1.5 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-source-serif font-bold text-xs text-[#29251F] leading-tight block truncate w-full">
              {languageMode === 'odia' ? 'ଜ୍ଞାନ ମାନଚିତ୍ର' : 'Concept Map'}
            </span>
            <span className="text-[10px] text-[#6D675E] mt-0.5">
              Optics Tree
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateNav('plan')}
            className="p-2.5 rounded-xl bg-[#F8F2E7] border border-[#D7C4A5]/70 hover:border-[#C7974A]/60 hover:bg-[#FAF5ED] shadow-2xs flex flex-col items-center text-center transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFF4D6] border border-[#E8D7B8] flex items-center justify-center text-[#C7974A] mb-1.5 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <span className="font-source-serif font-bold text-xs text-[#29251F] leading-tight block truncate w-full">
              {languageMode === 'odia' ? 'ଅଧ୍ୟୟନ ଯୋଜନା' : 'Study Plan'}
            </span>
            <span className="text-[10px] text-[#6D675E] mt-0.5">
              3 Quests
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};
