import React from 'react';
import { WifiOff, Sparkles, ArrowLeft, Languages } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { NavDestination, ScreenId } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AppShellProps {
  currentScreen: ScreenId;
  currentNav: NavDestination;
  onNavigateNav: (dest: NavDestination) => void;
  onNavigateScreen: (screen: ScreenId) => void;
  onBack?: () => void;
  isOfflineMode: boolean;
  currentXp: number;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentScreen,
  currentNav,
  onNavigateNav,
  onNavigateScreen,
  onBack,
  isOfflineMode,
  currentXp,
  children,
}) => {
  const { languageMode, toggleLanguage, t } = useLanguage();
  const isSubScreen = ['mock-test', 'report', 'why-engine'].includes(currentScreen);

  const getSubScreenTitle = () => {
    switch (currentScreen) {
      case 'mock-test':
        return languageMode === 'odia' ? 'ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ମକ୍ (Diagnostic Mock)' : 'Diagnostic Mock';
      case 'report':
        return languageMode === 'odia' ? 'ମାର୍କ ରିକଭରି ରିପୋର୍ଟ' : 'Mark Recovery Report';
      case 'why-engine':
        return languageMode === 'odia' ? 'WHY Engine ଡାଇଗ୍ନୋସିସ୍' : 'WHY Engine Diagnosis';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] flex justify-center text-[#191817]">
      
      <div className="w-full max-w-[430px] min-h-screen bg-[#F3E7D2] shadow-2xl flex flex-col relative border-x border-[#D7C4A5]/70 overflow-x-hidden font-operational text-[#29251F]">

        <header className={`sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between min-h-[52px] transition-colors ${currentScreen === 'home' ? 'bg-[#FAF5ED]/50 backdrop-blur-xs border-b border-[#D7C4A5]/40' : 'bg-[#F8F2E7]/95 backdrop-blur-md border-b border-[#D7C4A5]/60'}`}>
          {isSubScreen ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                type="button"
                onClick={onBack || (() => onNavigateNav('home'))}
                className="w-8 h-8 rounded-full bg-[#F8F2E7] border border-[#D7C4A5] flex items-center justify-center text-[#29251F] hover:bg-[#FBEAE3] hover:text-[#C45C38] hover:border-[#C45C38]/40 transition-colors cursor-pointer shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0 flex-1">
                <span className="font-source-serif font-semibold text-base text-[#29251F] truncate block">
                  {getSubScreenTitle()}
                </span>
                <span className="text-[9px] text-[#6D675E] block font-operational uppercase tracking-[0.18em] leading-none truncate">
                  NIDANA · Team MARGYN
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateNav('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity select-none group"
              title="Go to Home"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C45C38] flex items-center justify-center text-white font-source-serif font-bold text-sm shadow-xs ring-1 ring-[#C7974A]/30 shrink-0">
                N
              </div>
              <div className="min-w-0">
                <span className="font-source-serif font-bold text-base tracking-tight text-[#29251F] block leading-none">
                  NIDANA
                </span>
                <span className="text-[9px] text-[#6D675E] uppercase tracking-[0.2em] font-operational font-medium block leading-tight mt-0.5">
                  Team MARGYN
                </span>
              </div>
            </button>
          )}

          <div className="flex items-center gap-2 shrink-0">
            
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 text-[11px] font-operational font-semibold bg-[#E8EFF0] text-[#0E7C7B] px-2.5 py-1 rounded-full border border-[#0E7C7B]/30 hover:bg-[#d9e8e9] transition-colors cursor-pointer select-none"
              title="Switch language between Odia and English"
            >
              <Languages className="w-3 h-3" />
              <span className="font-odia font-semibold">
                {languageMode === 'odia' ? 'ଓଡ଼ିଆ' : languageMode === 'bilingual' ? 'Bi' : 'EN'}
              </span>
            </button>

            {isOfflineMode ? (
              <button
                type="button"
                onClick={() => onNavigateScreen('profile')}
                className="inline-flex items-center gap-1 text-[11px] font-operational font-medium bg-[#FFF4D6] text-[#A66F0D] px-2.5 py-1 rounded-full border border-[#C7974A]/40 hover:bg-[#ffeec2] transition-colors cursor-pointer"
                title="Offline mode active - Tap to view offline pack"
              >
                <WifiOff className="w-3 h-3" />
                <span>{t.offlineBadge}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium bg-[#F8F2E7] text-[#29251F] px-2.5 py-1 rounded-full border border-[#D7C4A5] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C7974A]" />
                <span className="text-[#C7974A] font-bold">{currentXp}</span>
                <span className="text-[10px] text-[#6D675E] font-operational">XP</span>
              </div>
            )}
          </div>
        </header>

        {isOfflineMode && (
          <div className="bg-[#FFF4D6] border-b border-[#D99A2B]/30 px-4 py-2 text-xs text-[#A66F0D] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {languageMode === 'odia'
                  ? 'ଅଫଲାଇନ୍ ମୋଡ୍ ସକ୍ରିୟ। ସ୍ଥାନୀୟ ଡାଇଗ୍ନୋସିସ୍ ପ୍ରସ୍ତୁତ।'
                  : 'Local diagnosis ready. Attempts queued.'}
              </span>
            </div>
            <button
              onClick={() => onNavigateScreen('profile')}
              className="text-xs font-semibold underline hover:text-[#191817] cursor-pointer ml-2 shrink-0"
            >
              View pack
            </button>
          </div>
        )}

        <main className="flex-1 px-4 pt-3 pb-28 md:pb-32 overflow-y-auto">
          {children}
        </main>

        <BottomNavigation
          currentDestination={currentNav}
          onNavigate={onNavigateNav}
        />
      </div>
    </div>
  );
};
