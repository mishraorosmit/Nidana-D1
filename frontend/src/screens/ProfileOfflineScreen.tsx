import React, { useState, useEffect } from 'react';
import { Download, HardDrive, RefreshCw, Wifi, WifiOff, Award, Globe, ShieldCheck, Check, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SyncStatus } from '../components/SyncStatus';
import { sampleOfflinePackInfo } from '../data/mockData';
import { StudentProfile, SyncState, ScreenId } from '../types';
import { storageService, QueuedAttempt } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';

interface ProfileOfflineScreenProps {
  profile: StudentProfile;
  isOfflineMode: boolean;
  onToggleOfflineMode: (offline: boolean) => void;
  syncState: SyncState;
  onSetSyncState: (state: SyncState) => void;
  onNavigate?: (screen: ScreenId) => void;
}

export const ProfileOfflineScreen: React.FC<ProfileOfflineScreenProps> = ({
  profile,
  isOfflineMode,
  onToggleOfflineMode,
  syncState,
  onSetSyncState,
  onNavigate,
}) => {
  const pack = sampleOfflinePackInfo;
  const { languageMode, setLanguageMode, t } = useLanguage();
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queuedAttempts, setQueuedAttempts] = useState<QueuedAttempt[]>([]);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    const attempts = storageService.getQueuedAttempts();
    setQueuedAttempts(attempts);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      if (!isOfflineMode) {
        handleSimulateSync();
      }
    };

    const handleOffline = () => {
      setBrowserOnline(false);
      onSetSyncState('queued');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineMode]);

  const handleSimulateSync = () => {
    if (isOfflineMode) {
      setSyncNotice('Cannot sync while in simulated offline mode. Switch to online first.');
      return;
    }

    onSetSyncState('syncing');
    setSyncNotice('Simulated sync in progress: Preparing local records...');

    setTimeout(() => {
      onSetSyncState('synced');
      const updated = queuedAttempts.map((a) => ({ ...a, status: 'synced' as const, timestamp: 'Synced just now' }));
      setQueuedAttempts(updated);
      storageService.saveQueuedAttempts(updated);
      storageService.setSyncState('synced');
      setSyncNotice('Prototype sync completed: Attempts backed up in local browser storage (simulated cloud sync).');
    }, 1800);
  };

  const handleQueueNewAttempt = () => {
    const newAttempt = storageService.addQueuedAttempt({
      name: `Untimed Practice Check #${queuedAttempts.length + 1}`,
      concept: 'Physics · Refraction',
      details: 'Draft answer and confidence rating stored locally',
    });
    setQueuedAttempts(storageService.getQueuedAttempts());
    onSetSyncState('queued');
    storageService.setSyncState('queued');
    setSyncNotice('New attempt stored in local browser queue. Will sync when online.');
  };

  const activeQueuedCount = queuedAttempts.filter((a) => a.status === 'queued').length;

  return (
    <div className="space-y-4 pb-12">
      
      <header className="pt-2">
        <h1 className="font-serif-display text-2xl font-semibold text-[#191817] leading-tight">
          Offline mode
        </h1>
        <p className="text-[14px] text-[#6B6A67] font-ui mt-0.5">
          {pack.statusSubtitle}
        </p>
      </header>

      <Card variant="default" className="p-4 border border-[#E4E0D8] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FBEAE3] border border-[#C96442]/30 flex items-center justify-center font-serif-display font-bold text-lg text-[#C96442]">
            {profile.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-ui font-semibold text-[17px] text-[#191817]">
              {profile.name}
            </h2>
            <p className="text-xs text-[#6B6A67]">
              {profile.levelTitle} · {profile.currentXp} XP · {profile.streakDays}-day streak
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs bg-[#E5F3E9] text-[#2F7D4F] px-2.5 py-1 rounded-full font-mono font-medium border border-[#2F7D4F]/20">
              +{profile.recoveredMarks} Recovered
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#E4E0D8]/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {profile.studentClass ? (
              <span className="bg-[#FBEAE3] text-[#A34F33] font-semibold px-2 py-0.5 rounded-md text-[11px]">
                {profile.studentClass}
              </span>
            ) : null}
            {profile.learningLanguages && profile.learningLanguages.length > 0 ? (
              <span className="text-[#6B6A67] text-[11px]">
                {profile.learningLanguages.join(', ')}
              </span>
            ) : (
              <span className="text-[#6B6A67] text-[11px]">
                Profile setup not configured
              </span>
            )}
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('profile-setup')}
              className="text-[#C96442] hover:text-[#A34F33] font-semibold underline text-xs cursor-pointer ml-2 shrink-0"
            >
              {profile.isProfileSetupComplete ? 'Edit Profile Setup' : 'Configure Setup'}
            </button>
          )}
        </div>
      </Card>

      <Card variant={isOfflineMode ? 'soft-gold' : 'default'} className="p-4 border border-[#E4E0D8]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isOfflineMode ? (
              <WifiOff className="w-5 h-5 text-[#D99A2B]" />
            ) : browserOnline ? (
              <Wifi className="w-5 h-5 text-[#2F7D4F]" />
            ) : (
              <WifiOff className="w-5 h-5 text-[#B3402F]" />
            )}
            <div>
              <div className="font-ui font-semibold text-sm text-[#191817]">
                {isOfflineMode
                  ? 'Simulated Offline Mode Active'
                  : browserOnline
                  ? 'Device Connected (Online)'
                  : 'No Internet Connection (Browser Offline)'}
              </div>
              <p className="text-xs text-[#6B6A67]">
                {isOfflineMode
                  ? 'Local diagnosis active. Network requests paused.'
                  : browserOnline
                  ? 'Browser has internet access. Prototype sync available.'
                  : 'Running purely from cached local storage.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleOfflineMode(!isOfflineMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
              isOfflineMode
                ? 'bg-[#D99A2B] text-white hover:bg-[#b8801d]'
                : 'bg-[#F7F5F0] border border-[#E4E0D8] text-[#191817] hover:bg-white'
            }`}
          >
            {isOfflineMode ? 'Switch Online' : 'Simulate Offline'}
          </button>
        </div>
      </Card>

      <SyncStatus
        state={syncState}
        queuedCount={activeQueuedCount}
        onRetry={handleSimulateSync}
      />

      <div className="p-3 bg-white rounded-[14px] border border-[#E4E0D8] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#191817]">Prototype Sync Lifecycle:</span>
          <span className="text-[11px] text-[#6B6A67] italic">(Truthful local simulation)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['synced', 'queued', 'syncing', 'retrying', 'failed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                onSetSyncState(st);
                storageService.setSyncState(st);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize cursor-pointer border transition-colors ${
                syncState === st
                  ? 'bg-[#191817] text-white border-[#191817]'
                  : 'bg-[#F7F5F0] text-[#6B6A67] border-[#E4E0D8] hover:bg-white'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={handleSimulateSync}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#C96442] text-white cursor-pointer font-medium hover:bg-[#A34F33]"
          >
            Run Sync
          </button>
          <button
            type="button"
            onClick={handleQueueNewAttempt}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#E3F2F1] text-[#0E7C7B] cursor-pointer font-medium hover:bg-[#cbeae8]"
          >
            + Add Attempt
          </button>
        </div>
        {syncNotice && (
          <p className="text-[11px] text-[#0E7C7B] font-ui pt-1 border-t border-[#E4E0D8]/60">
            {syncNotice}
          </p>
        )}
      </div>

      <section className="space-y-3 pt-1" aria-label="Offline capabilities">
        
        <Card className="p-4 border border-[#E4E0D8] shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E3F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h3 className="font-ui font-semibold text-sm text-[#191817]">
                  Diagnostic pack downloaded
                </h3>
                <span className="text-[11px] font-semibold text-[#2F7D4F] bg-[#E5F3E9] px-2 py-0.5 rounded-full shrink-0">
                  Available offline
                </span>
              </div>
              <p className="text-xs text-[#6B6A67] leading-relaxed">
                5 questions, Odia variants, untimed retry, and prerequisite check.
              </p>
              <div className="text-[11px] text-[#0E7C7B] mt-2 font-mono">
                1.4 MB cached on device · Cached in browser localStorage
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-[#E4E0D8] shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF4D6] text-[#A66F0D] flex items-center justify-center shrink-0 mt-0.5">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h3 className="font-ui font-semibold text-sm text-[#191817]">
                  {queuedAttempts.length} attempts queued
                </h3>
                <span className="text-[11px] font-semibold text-[#A66F0D] bg-[#FFF4D6] px-2 py-0.5 rounded-full shrink-0 border border-[#D99A2B]/30">
                  Queued locally
                </span>
              </div>
              <p className="text-xs text-[#6B6A67] leading-relaxed">
                They will sync automatically when the network returns.
              </p>

              <div className="mt-2.5 space-y-1.5">
                {queuedAttempts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-[11px] bg-[#F7F5F0] p-2 rounded-lg text-[#191817]"
                  >
                    <div className="truncate mr-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[#6B6A67] block text-[10px]">{item.details}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                        item.status === 'synced' ? 'bg-[#E5F3E9] text-[#2F7D4F]' : 'bg-[#FFF4D6] text-[#A66F0D]'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[#6B6A67] block text-[10px]">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-[#E4E0D8] shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E7EFF7] text-[#2A5C8A] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h3 className="font-ui font-semibold text-sm text-[#191817]">
                  Offline diagnosis available
                </h3>
                <span className="text-[11px] font-semibold text-[#2F7D4F] bg-[#E5F3E9] px-2 py-0.5 rounded-full shrink-0">
                  Available offline
                </span>
              </div>
              <p className="text-xs text-[#6B6A67] leading-relaxed">
                NIDANA can detect language friction and time pressure locally.
              </p>
              <div className="text-[11px] text-[#2A5C8A] mt-2 font-mono">
                Runs on embedded rule-based decision trees without internet.
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-[#E4E0D8] shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] text-[#6B6A67] flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h3 className="font-ui font-semibold text-sm text-[#191817]">
                  Deep AI diagnosis
                </h3>
                <span className="text-[11px] font-semibold text-[#6B6A67] bg-[#F7F5F0] px-2 py-0.5 rounded-full shrink-0 border border-[#E4E0D8]">
                  Requires connection
                </span>
              </div>
              <p className="text-xs text-[#6B6A67] leading-relaxed">
                Available after reconnecting.
              </p>
              <div className="text-[11px] text-[#6B6A67] mt-2 font-mono">
                Status: Queued for cloud analysis upon network connection.
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="pt-2" aria-label="Earned achievements">
        <h3 className="font-ui font-semibold text-sm text-[#191817] mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#D99A2B]" />
          <span>Earned Badges</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {pack.studentBadges.map((badge) => (
            <div
              key={badge.id}
              className="p-3 bg-white rounded-[14px] border border-[#E4E0D8] text-center shadow-2xs"
            >
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#FFF4D6] text-[#D99A2B] flex items-center justify-center text-xs font-bold">
                ★
              </div>
              <div className="font-ui font-semibold text-xs text-[#191817] line-clamp-2 leading-tight">
                {badge.title}
              </div>
              <span className="text-[10px] text-[#6B6A67] mt-0.5 block">
                {badge.level}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-2" aria-label="Language preferences">
        <h3 className="font-ui font-semibold text-sm text-[#191817] mb-2 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#0E7C7B]" />
          <span>{t.languageComfortHeading}</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'odia', label: 'ଓଡ଼ିଆ-First', sub: 'Primary Odia' },
            { id: 'bilingual', label: 'Bilingual', sub: 'Odia + English' },
            { id: 'english', label: 'English', sub: 'Exam standard' },
          ].map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguageMode(lang.id as any)}
              className={`p-2.5 rounded-[12px] border text-left cursor-pointer transition-colors ${
                languageMode === lang.id
                  ? 'bg-[#E3F2F1] border-[#0E7C7B] text-[#0E7C7B] ring-1.5 ring-[#0E7C7B]'
                  : 'bg-white border-[#E4E0D8] text-[#191817] hover:border-[#0E7C7B]/40'
              }`}
            >
              <div className="text-xs font-semibold">{lang.label}</div>
              <div className="text-[10px] text-[#6B6A67]">{lang.sub}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="p-3.5 bg-[#F7F5F0] rounded-[14px] border border-[#E4E0D8] text-xs text-[#6B6A67] leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#C96442] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#191817]">Truthful offline architecture:</strong> Because no live cloud database is configured for this prototype, all queued attempts and draft scores are safely persisted in your browser's local storage and survive page refreshes. Cloud syncing is demonstrated in a truthful, controlled prototype simulation.
        </span>
      </div>
    </div>
  );
};
