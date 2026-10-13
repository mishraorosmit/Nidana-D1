import { StudentProfile, Quest, ConceptNodeData, MissionData, MockQuestion } from '../types';

export const initialStudentProfile: StudentProfile = {
  name: 'Smita',
  greetingOdia: 'ନମସ୍କାର, Smita',
  level: 4,
  levelTitle: 'Level 4: Mark Detective',
  currentXp: 320,
  nextLevelXp: 400,
  streakDays: 5,
  recoverableMarks: 22,
  recoveredMarks: 14,
  breakdown: {
    englishTerminology: 8,
    timePressure: 6,
    conceptGaps: 8,
  },
};

export const sampleMissions: MissionData[] = [
  {
    id: 'mission-diagnostic',
    title: 'Diagnostic Mock',
    purpose: 'Find why you are losing marks.',
    effortText: '5 questions · about 8 minutes',
    xpReward: 40,
    type: 'diagnostic',
  },
  {
    id: 'mission-language-bridge',
    title: 'Language Bridge',
    purpose: 'Repair English terminology friction.',
    effortText: 'Refraction terminology · about 10 minutes',
    xpReward: 25,
    type: 'bridge',
  },
  {
    id: 'mission-pacing',
    title: 'Pacing Drill',
    purpose: 'Practise solving under time pressure.',
    effortText: 'Speed and confidence check · about 6 minutes',
    xpReward: 30,
    type: 'pacing',
  },
  {
    id: 'mission-recovery-check',
    title: 'Recovery Check',
    purpose: 'Prove that your refraction weakness is recovered.',
    effortText: 'Prerequisite and formula review · about 5 minutes',
    xpReward: 50,
    type: 'recovery',
  },
];

export const sampleQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Refraction terminology bridge',
    subtitle: '10 min · Terminology alignment',
    durationMinutes: 10,
    xpReward: 25,
    whyReason: 'You answered correctly after the Odia term was clarified.',
    isCompleted: false,
    type: 'bridge',
  },
  {
    id: 'quest-2',
    title: 'Pacing drill',
    subtitle: '6 min · Timed speed check',
    durationMinutes: 6,
    xpReward: 30,
    whyReason: 'You solved correctly without a timer but ran out of time originally.',
    isCompleted: false,
    type: 'pacing',
  },
  {
    id: 'quest-3',
    title: 'Recovery check',
    subtitle: '6 min · Verification challenge',
    durationMinutes: 6,
    xpReward: 50,
    whyReason: 'Confirm that your refraction weakness is recovered.',
    isCompleted: false,
    type: 'recovery-check',
  },
];

export const sampleConceptNodes: ConceptNodeData[] = [
  {
    id: 'c-reflection',
    title: 'Reflection',
    titleOdia: 'ପ୍ରତିଫଳନ',
    status: 'mastered',
    accuracy: 92,
    statusLabel: 'Mastered · 92% accuracy',
    description: 'Laws of reflection, plane and curved mirrors mastered with strong accuracy.',
    prerequisiteOf: ['c-refraction'],
  },
  {
    id: 'c-refraction',
    title: 'Refraction',
    titleOdia: 'ପ୍ରତିସରଣ',
    status: 'language-friction',
    recoverableMarks: 4,
    statusLabel: 'Language friction detected · 4 marks recoverable',
    description: 'Core physical model is understood, but English test labels create recognition delays.',
    prerequisiteOf: ['c-lens-formula'],
    dependsOn: 'Reflection',
  },
  {
    id: 'c-ratio',
    title: 'Ratio and proportion',
    titleOdia: 'ଅନୁପାତ ଓ ସମାନୁପାତ',
    status: 'prerequisite-gap',
    recoverableMarks: 3,
    statusLabel: 'Prerequisite gap detected',
    description: 'Speed of light ratios require numerical formula practice before lens calculations.',
    prerequisiteOf: ['c-lens-formula'],
  },
  {
    id: 'c-lens-formula',
    title: 'Lens formula',
    titleOdia: 'ଲେନ୍ସ ସୂତ୍ର (1/f = 1/v - 1/u)',
    status: 'locked',
    statusLabel: 'Locked until prerequisites improve',
    description: 'Requires firm mastery of Refraction terms and Ratio calculations to unlock.',
    dependsOn: 'Ratio and proportion & Refraction',
  },
];

export const sampleMockQuestion: MockQuestion = {
  id: 'q-refraction-1',
  subject: 'Physics',
  concept: 'Refraction',
  marks: 4,
  questionNumber: 3,
  totalQuestions: 5,
  questionTextEn: 'Which phenomenon causes light to bend when it enters water?',
  questionTextOd: 'ଆଲୋକ ଜଳରେ ପ୍ରବେଶ କଲାବେଳେ କେଉଁ ପ୍ରକ୍ରିୟା ଯୋଗୁଁ ଏହା ବଙ୍କା ହୁଏ?',
  optionsEn: [
    { id: 'A', text: 'Reflection' },
    { id: 'B', text: 'Refraction' },
    { id: 'C', text: 'Dispersion' },
    { id: 'D', text: 'Diffraction' },
  ],
  optionsOd: [
    { id: 'A', text: 'ପ୍ରତିଫଳନ (Reflection)' },
    { id: 'B', text: 'ପ୍ରତିସରଣ (Refraction)' },
    { id: 'C', text: 'ବିଚ୍ଛୁରଣ (Dispersion)' },
    { id: 'D', text: 'ବିବର୍ତ୍ତନ (Diffraction)' },
  ],
  correctOptionId: 'B',
  explanationEn: 'When light passes from one transparent medium (air) to another (water) of different optical density, its speed changes causing it to change direction. This phenomenon is called Refraction.',
  explanationOd: 'ଆଲୋକ ଏକ ମାଧ୍ୟମରୁ (ବାୟୁ) ଅନ୍ୟ ଏକ ସ୍ୱଚ୍ଛ ମାଧ୍ୟମକୁ (ଜଳ) ଗତି କଲାବେଳେ ଏହାର ବେଗ ବଦଳିବା ଯୋଗୁଁ ଦିଗ ପରିବର୍ତ୍ତନ ହୁଏ, ଏହାକୁ ପ୍ରତିସରଣ (Refraction) କୁହାଯାଏ।',
};

export const sampleRecoveryReportData = {
  subtitle: 'You lost 28 marks. 19 are recoverable.',
  recoverableMarks: 19,
  lostMarks: 28,
  reassurance: 'Your Physics understanding is stronger than your score suggests.',
  causes: [
    {
      id: 'cause-1',
      title: 'English terminology friction',
      titleOdia: 'ଇଂରାଜୀ ଶବ୍ଦାବଳୀ ବୁଝିବାରେ ଅସୁବିଧା',
      recoverableMarks: 8,
      evidence: 'You answered correctly after the Odia term bridge.',
      recommendedAction: 'Start terminology bridge drill',
      color: '#0E7C7B',
    },
    {
      id: 'cause-2',
      title: 'Time pressure',
      titleOdia: 'ସମୟ ଚାପ',
      recoverableMarks: 6,
      evidence: 'You answered correctly in the untimed retry.',
      recommendedAction: 'Pacing drill without penalty',
      color: '#D99A2B',
    },
    {
      id: 'cause-3',
      title: 'Prerequisite gap',
      titleOdia: 'ପୂର୍ବ ଧାରଣା ଅଭାବ',
      recoverableMarks: 3,
      evidence: 'The ratio concept needs a short repair.',
      recommendedAction: 'Quick 5-minute ratio review',
      color: '#C96442',
    },
  ],
};

export const sampleWhyDiagnosisSteps = {
  context: 'Refraction · 4 marks',
  observed: 'You selected option B after 22 seconds and reported low confidence.',
  hypotheses: [
    'Did the student confuse the optical phenomenon concept?',
    'Did the English technical label create hesitation?',
    'Was calculation speed the bottleneck?',
  ],
  tested: 'It showed the question with the English term clarified in Odia.',
  probeResult: 'You solved the Odia version correctly.',
  probeStatus: 'Correct',
  verifiedCause: 'English terminology friction. Your Physics concept was correct.',
  counterfactual: 'With the Odia term clarified, you would likely have earned these 4 marks.',
  recommendedRepair: 'Repair terminology gap',
  recommendedRepairDuration: '10-minute bridge task',
};

export const sampleOfflinePackInfo = {
  title: 'Offline mode',
  statusSubtitle: 'Your mission pack is ready.',
  downloadedPack: {
    title: 'Diagnostic pack downloaded',
    content: '5 questions, Odia variants, untimed retry, and prerequisite check.',
    size: '1.4 MB cached on device',
    lastSync: 'Today at 08:30 AM',
  },
  queuedAttempts: {
    count: 2,
    title: '2 attempts queued',
    explanation: 'They will sync automatically when the network returns.',
    items: [
      { name: 'Physics Refraction Untimed Probe', time: '12 min ago' },
      { name: 'Ratio & Speed Check Drill', time: 'Just now' },
    ],
  },
  localDiagnosis: {
    title: 'Offline diagnosis available',
    explanation: 'NIDANA can detect language friction and time pressure locally.',
    activeRule: 'Local rule engine active',
  },
  deepAi: {
    title: 'Deep AI diagnosis',
    explanation: 'Available after reconnecting.',
    status: 'Queued for cloud analysis',
  },
  studentBadges: [
    { id: 'b1', title: 'Terminology Bridge Builder', level: 'Silver', icon: 'Languages' },
    { id: 'b2', title: 'Pacing Strategist', level: 'Bronze', icon: 'Timer' },
    { id: 'b3', title: 'Recovery Champion', level: 'Gold', icon: 'ShieldCheck' },
  ],
};
