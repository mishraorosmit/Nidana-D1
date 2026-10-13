import { StudentProfile, Quest, SyncState } from '../types';
import { initialStudentProfile } from '../data/mockData';

export interface QueuedAttempt {
  id: string;
  name: string;
  concept: string;
  timestamp: string;
  status: 'queued' | 'synced';
  details: string;
}

const STORAGE_KEYS = {
  PROFILE: 'nidana_student_profile',
  COMPLETED_QUESTS: 'nidana_completed_quests',
  QUEUED_ATTEMPTS: 'nidana_queued_attempts',
  SYNC_STATE: 'nidana_sync_state',
  OFFLINE_MODE: 'nidana_offline_mode',
  RECOVERED_WEAKNESSES: 'nidana_recovered_weaknesses',
  PROFILE_SETUP_DONE: 'nidana_profile_setup_done',
};

const INITIAL_QUEUED_ATTEMPTS: QueuedAttempt[] = [
  {
    id: 'attempt-1',
    name: 'Physics Refraction Untimed Probe',
    concept: 'Physics · Refraction',
    timestamp: '12 min ago',
    status: 'queued',
    details: 'Option B evaluated with Odia term probe',
  },
  {
    id: 'attempt-2',
    name: 'Ratio & Speed Check Drill',
    concept: 'Mathematics / Physics · Ratio',
    timestamp: 'Just now',
    status: 'queued',
    details: 'Prerequisite calculation drill saved locally',
  },
];

class StorageService {
  private isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window;
    } catch {
      return false;
    }
  }

  getProfile(): StudentProfile {
    if (!this.isAvailable()) return initialStudentProfile;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        const parsed = JSON.parse(data) as StudentProfile;
        if (parsed.breakdown) {
          if (this.isWeaknessRecovered('refraction-terminology') && parsed.breakdown.englishTerminology === 8) {
            parsed.breakdown.englishTerminology = 4;
          }
          parsed.recoverableMarks =
            parsed.breakdown.englishTerminology +
            parsed.breakdown.timePressure +
            parsed.breakdown.conceptGaps;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read profile from localStorage:', e);
    }
    return initialStudentProfile;
  }

  saveProfile(profile: StudentProfile): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }

  getCompletedQuestIds(): string[] {
    if (!this.isAvailable()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_QUESTS);
      if (data) {
        return JSON.parse(data) as string[];
      }
    } catch (e) {
      console.warn('Failed to read quests from localStorage:', e);
    }
    return [];
  }

  saveCompletedQuestIds(questIds: string[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_QUESTS, JSON.stringify(questIds));
    } catch (e) {
      console.warn('Failed to save quests to localStorage:', e);
    }
  }

  getQueuedAttempts(): QueuedAttempt[] {
    if (!this.isAvailable()) return INITIAL_QUEUED_ATTEMPTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUED_ATTEMPTS);
      if (data) {
        return JSON.parse(data) as QueuedAttempt[];
      }
      this.saveQueuedAttempts(INITIAL_QUEUED_ATTEMPTS);
      return INITIAL_QUEUED_ATTEMPTS;
    } catch (e) {
      console.warn('Failed to read queued attempts from localStorage:', e);
      return INITIAL_QUEUED_ATTEMPTS;
    }
  }

  saveQueuedAttempts(attempts: QueuedAttempt[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUED_ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Failed to save queued attempts to localStorage:', e);
    }
  }

  addQueuedAttempt(attempt: Omit<QueuedAttempt, 'id' | 'timestamp' | 'status'>): QueuedAttempt {
    const attempts = this.getQueuedAttempts();
    const newAttempt: QueuedAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
      timestamp: 'Just now',
      status: 'queued',
    };
    const updated = [newAttempt, ...attempts];
    this.saveQueuedAttempts(updated);
    return newAttempt;
  }

  getSyncState(): SyncState {
    if (!this.isAvailable()) return 'queued';
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_STATE) as SyncState;
      if (data) return data;
    } catch (e) {
      console.warn('Failed to read sync state from localStorage:', e);
    }
    return 'queued';
  }

  setSyncState(state: SyncState): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_STATE, state);
    } catch (e) {
      console.warn('Failed to save sync state to localStorage:', e);
    }
  }

  getOfflineMode(): boolean {
    if (!this.isAvailable()) return false;
    try {
      return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
    } catch {
      return false;
    }
  }

  setOfflineMode(isOffline: boolean): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, isOffline ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save offline mode to localStorage:', e);
    }
  }

  isWeaknessRecovered(weaknessId: string): boolean {
    if (!this.isAvailable()) return false;
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECOVERED_WEAKNESSES) || '[]') as string[];
      return list.includes(weaknessId);
    } catch {
      return false;
    }
  }

  markWeaknessRecovered(weaknessId: string): void {
    if (!this.isAvailable()) return;
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECOVERED_WEAKNESSES) || '[]') as string[];
      if (!list.includes(weaknessId)) {
        list.push(weaknessId);
        localStorage.setItem(STORAGE_KEYS.RECOVERED_WEAKNESSES, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed to mark weakness recovered in localStorage:', e);
    }
  }

  isProfileSetupComplete(): boolean {
    if (!this.isAvailable()) return false;
    try {
      return localStorage.getItem(STORAGE_KEYS.PROFILE_SETUP_DONE) === 'true';
    } catch {
      return false;
    }
  }

  setProfileSetupComplete(completed: boolean): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE_SETUP_DONE, completed ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save profile setup status to localStorage:', e);
    }
  }
}

export const storageService = new StorageService();
