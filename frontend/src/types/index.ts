export type ScreenId = 
  | 'home' 
  | 'practice' 
  | 'mock-test' 
  | 'report' 
  | 'why-engine' 
  | 'map' 
  | 'plan' 
  | 'profile'
  | 'profile-setup';

export type NavDestination = 'home' | 'practice' | 'map' | 'plan' | 'profile';

export type SyncState = 'synced' | 'queued' | 'syncing' | 'failed' | 'retrying';

export interface StudentProfile {
  name: string;
  greetingOdia: string;
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  recoverableMarks: number;
  recoveredMarks: number;
  breakdown: {
    englishTerminology: number;
    timePressure: number;
    conceptGaps: number;
  };
  age?: number;
  studentClass?: 'Class 9' | 'Class 10' | 'Class 12' | '9' | '10' | '12' | '';
  classLevel?: 9 | 10 | 12;
  learningLanguages?: string[];
  isProfileSetupComplete?: boolean;
}

export interface ProfileSetupData {
  name: string;
  age: number;
  studentClass: 'Class 9' | 'Class 10' | 'Class 12' | '9' | '10' | '12';
  classLevel: 9 | 10 | 12;
  learningLanguages: string[];
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  xpReward: number;
  whyReason: string;
  isCompleted: boolean;
  type: 'bridge' | 'pacing' | 'recovery-check' | 'diagnostic';
}

export interface ConceptNodeData {
  id: string;
  title: string;
  titleOdia?: string;
  status: 'mastered' | 'language-friction' | 'prerequisite-gap' | 'locked';
  accuracy?: number;
  recoverableMarks?: number;
  statusLabel: string;
  description: string;
  prerequisiteOf?: string[];
  dependsOn?: string;
}

export interface MissionData {
  id: string;
  title: string;
  purpose: string;
  effortText: string;
  xpReward: number;
  type: 'diagnostic' | 'bridge' | 'pacing' | 'recovery';
}

export interface MockQuestion {
  id: string;
  subject: string;
  concept: string;
  marks: number;
  questionNumber: number;
  totalQuestions: number;
  questionTextEn: string;
  questionTextOd: string;
  optionsEn: { id: string; text: string }[];
  optionsOd: { id: string; text: string }[];
  correctOptionId: string;
  explanationEn: string;
  explanationOd: string;
}
