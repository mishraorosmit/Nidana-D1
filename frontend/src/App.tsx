import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from './components/AppShell';
import { RewardPanel } from './components/RewardPanel';
import { HomeScreen } from './screens/HomeScreen';
import { PracticeScreen } from './screens/PracticeScreen';
import { MockTestScreen } from './screens/MockTestScreen';
import { MarkRecoveryReportScreen } from './screens/MarkRecoveryReportScreen';
import { WhyEngineScreen } from './screens/WhyEngineScreen';
import { ConceptMapScreen } from './screens/ConceptMapScreen';
import { StudyPlanScreen } from './screens/StudyPlanScreen';
import { ProfileOfflineScreen } from './screens/ProfileOfflineScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { OdysseyPreloaderScreen } from './components/OdysseyPreloaderScreen';
import {
  sampleQuests,
  sampleConceptNodes,
} from './data/mockData';
import {
  ScreenId,
  NavDestination,
  StudentProfile,
  Quest,
  ConceptNodeData,
  SyncState,
  ProfileSetupData,
} from './types';
import { storageService } from './services/storageService';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

const VALID_SCREENS: ScreenId[] = [
  'home',
  'practice',
  'mock-test',
  'report',
  'why-engine',
  'map',
  'plan',
  'profile',
  'profile-setup',
];

const RECOVERY_WEAKNESS_KEY = 'refraction-terminology';

function MainApp() {
  const [showPreloader, setShowPreloader] = useState<boolean>(true);

  const getInitialScreen = (): ScreenId => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '') as ScreenId;
      if (VALID_SCREENS.includes(hash) && hash !== 'home' && hash !== 'profile-setup') {
        return hash;
      }
    }
    return 'profile-setup';
  };

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreen);

  const handlePreloaderFinish = useCallback(() => {
    setShowPreloader(false);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '') as ScreenId;
      if (VALID_SCREENS.includes(hash) && hash !== 'home' && hash !== 'profile-setup') {
        setCurrentScreen(hash);
        return;
      }
    }
    setCurrentScreen('profile-setup');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#profile-setup');
    }
  }, []);
  const [profile, setProfile] = useState<StudentProfile>(() => storageService.getProfile());
  
  const [quests, setQuests] = useState<Quest[]>(() => {
    const completedIds = storageService.getCompletedQuestIds();
    const isRecovered = storageService.isWeaknessRecovered(RECOVERY_WEAKNESS_KEY);
    return sampleQuests.map((q) => ({
      ...q,
      isCompleted: completedIds.includes(q.id) || (q.id === 'quest-1' && isRecovered),
    }));
  });

  const [concepts, setConcepts] = useState<ConceptNodeData[]>(() => {
    const isRecovered = storageService.isWeaknessRecovered(RECOVERY_WEAKNESS_KEY);
    if (isRecovered) {
      return sampleConceptNodes.map((c) =>
        c.id === 'c-refraction'
          ? {
              ...c,
              status: 'mastered',
              statusLabel: 'Weakness Recovered · 4 marks recovered',
              accuracy: 94,
              description: 'English term alignment verified via Odia bridge. Weakness successfully repaired!',
            }
          : c
      );
    }
    return sampleConceptNodes;
  });

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => storageService.getOfflineMode());
  const [syncState, setSyncState] = useState<SyncState>(() => storageService.getSyncState());
  const { languageMode } = useLanguage();

  const [rewardModal, setRewardModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    xpEarned?: number;
    marksRecovered?: number;
    badgeName?: string;
  }>({
    isOpen: false,
    title: '',
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') as ScreenId;
      if (VALID_SCREENS.includes(hash)) {
        setCurrentScreen(hash);
      } else {
        setCurrentScreen('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((screen: ScreenId) => {
    setCurrentScreen(screen);
    if (typeof window !== 'undefined') {
      if (window.location.hash !== `#${screen}`) {
        window.history.pushState(null, '', `#${screen}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavClick = useCallback((dest: NavDestination) => {
    navigateTo(dest);
  }, [navigateTo]);

  const getNavDestination = (screen: ScreenId): NavDestination => {
    switch (screen) {
      case 'home':
        return 'home';
      case 'practice':
      case 'mock-test':
        return 'practice';
      case 'map':
        return 'map';
      case 'plan':
        return 'plan';
      case 'profile':
        return 'profile';
      case 'report':
      case 'why-engine':
        return 'home';
      default:
        return 'home';
    }
  };

  const handleBack = () => {
    if (currentScreen === 'mock-test') {
      navigateTo('practice');
    } else if (currentScreen === 'report' || currentScreen === 'why-engine') {
      navigateTo('home');
    } else {
      navigateTo('home');
    }
  };

  const handleRepairCompleted = (xp: number, marks: number) => {
    const alreadyRecovered = storageService.isWeaknessRecovered(RECOVERY_WEAKNESS_KEY);

    if (!alreadyRecovered) {
      const updatedProfile = {
        ...profile,
        currentXp: profile.currentXp + xp,
        recoveredMarks: profile.recoveredMarks + marks,
        recoverableMarks: Math.max(0, profile.recoverableMarks - marks),
        breakdown: {
          ...profile.breakdown,
          englishTerminology: Math.max(0, profile.breakdown.englishTerminology - marks),
        },
      };
      setProfile(updatedProfile);
      storageService.saveProfile(updatedProfile);
      storageService.markWeaknessRecovered(RECOVERY_WEAKNESS_KEY);

      const updatedQuests = quests.map((q) =>
        q.id === 'quest-1' ? { ...q, isCompleted: true } : q
      );
      setQuests(updatedQuests);
      const completedIds = Array.from(new Set([...storageService.getCompletedQuestIds(), 'quest-1']));
      storageService.saveCompletedQuestIds(completedIds);
    }

    setConcepts((prev) =>
      prev.map((c) =>
        c.id === 'c-refraction'
          ? {
              ...c,
              status: 'mastered',
              statusLabel: languageMode === 'odia' ? 'ଦୁର୍ବଳତା ପୁନରୁଦ୍ଧାର ହେଲା · ୪ ମାର୍କ ମିଳିଲା' : 'Weakness Recovered · 4 marks recovered',
              accuracy: 94,
              description: 'English term alignment verified via Odia bridge. Weakness successfully repaired!',
            }
          : c
      )
    );

    setRewardModal({
      isOpen: true,
      title: languageMode === 'odia' ? 'ଦୁର୍ବଳତା ପୁନରୁଦ୍ଧାର ହେଲା!' : 'Weakness Recovered!',
      subtitle: alreadyRecovered
        ? (languageMode === 'odia' ? 'ଆପଣ ପୂର୍ବରୁ ଏହି ଧାରଣା ଯାଞ୍ଚ କରିସାରିଛନ୍ତି।' : 'You already verified and recovered this weakness previously.')
        : (languageMode === 'odia' ? 'ଆପଣ ପ୍ରତିସରଣରେ ଶବ୍ଦାବଳୀ ଘର୍ଷଣ ସମାଧାନ କଲେ।' : 'You verified the cause and closed the terminology friction in Refraction.'),
      xpEarned: alreadyRecovered ? 0 : xp,
      marksRecovered: alreadyRecovered ? 0 : marks,
      badgeName: 'Terminology Bridge Builder',
    });
  };

  const handleCompleteQuest = (questId: string, xp: number) => {
    const quest = quests.find((q) => q.id === questId);
    const alreadyDone = quest?.isCompleted;

    if (!alreadyDone) {
      const updatedQuests = quests.map((q) =>
        q.id === questId ? { ...q, isCompleted: true } : q
      );
      setQuests(updatedQuests);
      const completedIds = Array.from(new Set([...storageService.getCompletedQuestIds(), questId]));
      storageService.saveCompletedQuestIds(completedIds);

      const updatedProfile = {
        ...profile,
        currentXp: profile.currentXp + xp,
      };
      setProfile(updatedProfile);
      storageService.saveProfile(updatedProfile);

      setRewardModal({
        isOpen: true,
        title: languageMode === 'odia' ? 'କ୍ୱେଷ୍ଟ୍ ସମ୍ପୂର୍ଣ୍ଣ ହେଲା!' : 'Quest Completed!',
        subtitle: quest?.title || (languageMode === 'odia' ? 'ଆଜିର କାର୍ଯ୍ୟ ସଫଳତାର ସହ ଶେଷ କଲେ।' : 'Great job completing today’s task.'),
        xpEarned: xp,
      });
    }
  };

  const handleToggleOffline = (offline: boolean) => {
    setIsOfflineMode(offline);
    storageService.setOfflineMode(offline);
  };

  const handleSetSyncState = (st: SyncState) => {
    setSyncState(st);
    storageService.setSyncState(st);
  };

  const isSubmittingSetupRef = React.useRef(false);

  const handleProfileSetupComplete = (data: ProfileSetupData) => {
    if (isSubmittingSetupRef.current) return;
    isSubmittingSetupRef.current = true;

    const isOdia = data.learningLanguages.some((l) => l.includes('Odia'));
    const updatedProfile: StudentProfile = {
      ...profile,
      name: data.name,
      greetingOdia: isOdia ? `ନମସ୍କାର, ${data.name}` : `Welcome, ${data.name}`,
      age: data.age,
      studentClass: data.studentClass,
      classLevel: data.classLevel,
      learningLanguages: data.learningLanguages,
      isProfileSetupComplete: true,
    };
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
    storageService.setProfileSetupComplete(true);
    navigateTo('home');

    setTimeout(() => {
      isSubmittingSetupRef.current = false;
    }, 500);
  };

  return (
    <>
      {showPreloader && (
        <OdysseyPreloaderScreen
          onFinish={handlePreloaderFinish}
          videoSrc="/assets/nidana-odyssey-intro.mp4"
        />
      )}

      {currentScreen === 'profile-setup' ? (
        <div className="min-h-screen bg-[#F0EDE6] flex justify-center text-[#191817]">
          <ProfileSetupScreen
            initialValues={undefined}
            onComplete={handleProfileSetupComplete}
            onBack={() => navigateTo('home')}
          />
        </div>
      ) : (
        <AppShell
      currentScreen={currentScreen}
      currentNav={getNavDestination(currentScreen)}
      onNavigateNav={handleNavClick}
      onNavigateScreen={navigateTo}
      onBack={handleBack}
      isOfflineMode={isOfflineMode}
      currentXp={profile.currentXp}
    >
      {currentScreen === 'home' && (
        <HomeScreen
          profile={profile}
          onNavigate={navigateTo}
          onNavigateNav={handleNavClick}
          isOfflineMode={isOfflineMode}
        />
      )}

      {currentScreen === 'practice' && (
        <PracticeScreen
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'mock-test' && (
        <MockTestScreen
          onNavigate={navigateTo}
          onQuestionCompleted={(isCorrect, conf) => {
            if (syncState === 'synced') {
              handleSetSyncState('queued');
            }
          }}
        />
      )}

      {currentScreen === 'report' && (
        <MarkRecoveryReportScreen
          onNavigate={navigateTo}
          onNavigateNav={handleNavClick}
        />
      )}

      {currentScreen === 'why-engine' && (
        <WhyEngineScreen
          onNavigate={navigateTo}
          onNavigateNav={handleNavClick}
          onRepairCompleted={handleRepairCompleted}
        />
      )}

      {currentScreen === 'map' && (
        <ConceptMapScreen
          onNavigate={navigateTo}
          concepts={concepts}
        />
      )}

      {currentScreen === 'plan' && (
        <StudyPlanScreen
          onNavigate={navigateTo}
          quests={quests}
          onCompleteQuest={handleCompleteQuest}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileOfflineScreen
          profile={profile}
          isOfflineMode={isOfflineMode}
          onToggleOfflineMode={handleToggleOffline}
          syncState={syncState}
          onSetSyncState={handleSetSyncState}
          onNavigate={navigateTo}
        />
      )}

      <RewardPanel
        isOpen={rewardModal.isOpen}
        title={rewardModal.title}
        subtitle={rewardModal.subtitle}
        xpEarned={rewardModal.xpEarned}
        marksRecovered={rewardModal.marksRecovered}
        badgeName={rewardModal.badgeName}
        onClose={() => setRewardModal({ isOpen: false, title: '' })}
        actionLabel={languageMode === 'odia' ? 'ଆଗକୁ ବଢ଼ନ୍ତୁ' : 'Continue'}
      />
    </AppShell>
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
