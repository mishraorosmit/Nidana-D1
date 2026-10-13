export type LanguageMode = 'odia' | 'bilingual' | 'english';

export interface TranslationDictionary {
  navHome: string;
  navPractice: string;
  navMap: string;
  navPlan: string;
  navProfile: string;

  appTitle: string;
  teamAttribution: string;
  offlineBadge: string;
  xpLabel: string;

  greeting: string;
  homeSubtitle: string;
  streakText: string;
  recoveryPoints: string;
  levelTitle: string;
  xpToNextLevel: string;
  recoverableMarksTitle: string;
  recoverableMarksBreakdown: string;
  terminologyLoss: string;
  pacingLoss: string;
  conceptLoss: string;
  viewReportLink: string;
  todaysMissionTag: string;
  todaysMissionTitle: string;
  todaysMissionDesc: string;
  startMissionBtn: string;

  practiceTitle: string;
  practiceSubtitle: string;
  calmNotice: string;

  questionMeta: string;
  physicsRefraction: string;
  marksBadge: string;
  flagBtn: string;
  flaggedBtn: string;
  languageToggleBtn: string;
  submitAnswerBtn: string;
  selectOptionHint: string;
  correctAnswerTitle: string;
  incorrectAnswerTitle: string;
  confidenceQuestion: string;
  confidenceHint: string;
  lowConfidence: string;
  mediumConfidence: string;
  highConfidence: string;
  continueToReportBtn: string;
  investigateWhyBtn: string;

  reportTitle: string;
  reportSubtitle: string;
  reportHeroBadge: string;
  reportHeroText: string;
  reportHeroSubtitle: string;
  reassurancePrefix: string;
  reassuranceText: string;
  verifiedCausesHeading: string;
  startRecoveryPlanBtn: string;
  inspectTraceBtn: string;

  whyEngineTraceTag: string;
  whyTitle: string;
  whyContext: string;
  avoidableLossNotice: string;
  noticedTitle: string;
  noticedContent: string;
  testedTitle: string;
  testedContent: string;
  probeResultTitle: string;
  probeResultContent: string;
  causeTitle: string;
  causeContent: string;
  meansTitle: string;
  meansContent: string;
  repairGapBtn: string;

  mapTitle: string;
  mapSubtitle: string;
  masteredLabel: string;
  frictionLabel: string;
  gapsLabel: string;
  lockedLabel: string;

  planTitle: string;
  planSubtitle: string;
  completedQuestsBadge: string;
  startFirstQuestBtn: string;

  offlineTitle: string;
  offlineSubtitle: string;
  languageComfortHeading: string;
}

export const translations: Record<LanguageMode, TranslationDictionary> = {
  english: {
    navHome: 'Home',
    navPractice: 'Practice',
    navMap: 'Map',
    navPlan: 'Plan',
    navProfile: 'Profile',

    appTitle: 'NIDANA',
    teamAttribution: 'Team MARGYN',
    offlineBadge: 'Offline',
    xpLabel: 'XP',

    greeting: 'ନମସ୍କାର, Smita',
    homeSubtitle: 'Your next recovery is ready.',
    streakText: '5-day streak',
    recoveryPoints: 'Recovery Points',
    levelTitle: 'Level 4: Mark Detective',
    xpToNextLevel: '80 XP to Level 5',
    recoverableMarksTitle: '22 marks are recoverable',
    recoverableMarksBreakdown: '8 from English terminology, 6 from time pressure, and 8 from concept gaps.',
    terminologyLoss: 'Terminology',
    pacingLoss: 'Pacing',
    conceptLoss: 'Concepts',
    viewReportLink: 'View detailed recovery report',
    todaysMissionTag: "Today's mission",
    todaysMissionTitle: 'Complete a 10-minute refraction terminology bridge.',
    todaysMissionDesc: 'Align English technical terms with Odia concepts to recover 8 avoidable marks without confusing physical principles.',
    startMissionBtn: "Start today’s mission",

    practiceTitle: 'Choose a mission',
    practiceSubtitle: 'Pick what you want to improve today.',
    calmNotice: 'Calm learning game: Every mission isolates a specific variable—terminology, speed, or concepts—so you gain clarity without unnecessary exam pressure.',

    questionMeta: 'Question 3 of 5',
    physicsRefraction: 'Physics · Refraction',
    marksBadge: '4 marks',
    flagBtn: 'Flag',
    flaggedBtn: 'Flagged',
    languageToggleBtn: 'ଓଡ଼ିଆରେ ଦେଖନ୍ତୁ',
    submitAnswerBtn: 'Submit answer',
    selectOptionHint: 'Select an option above to submit',
    correctAnswerTitle: 'Correct Answer',
    incorrectAnswerTitle: 'Incorrect Answer',
    confidenceQuestion: 'How confident were you with this answer?',
    confidenceHint: 'Capturing confidence helps NIDANA isolate language friction from concept uncertainty.',
    lowConfidence: 'Low',
    mediumConfidence: 'Medium',
    highConfidence: 'High',
    continueToReportBtn: 'Continue to Mark Recovery Report',
    investigateWhyBtn: 'Investigate this mark loss in WHY Engine',

    reportTitle: 'Mark Recovery Report',
    reportSubtitle: 'You lost 28 marks. 19 are recoverable.',
    reportHeroBadge: 'Verified Recovery Potential',
    reportHeroText: '19 marks recoverable',
    reportHeroSubtitle: 'Avoidable loss identified across 3 targeted areas',
    reassurancePrefix: 'Reassurance: ',
    reassuranceText: 'Your Physics understanding is stronger than your score suggests.',
    verifiedCausesHeading: 'Verified causes of lost marks',
    startRecoveryPlanBtn: 'Start recovery plan',
    inspectTraceBtn: 'See WHY Engine reasoning trace',

    whyEngineTraceTag: 'WHY Engine Evidence Trace',
    whyTitle: 'Why did I lose this mark?',
    whyContext: 'Refraction · 4 marks',
    avoidableLossNotice: 'Avoidable mark loss investigation',
    noticedTitle: 'What NIDANA noticed',
    noticedContent: 'You selected option B after 22 seconds and reported low confidence.',
    testedTitle: 'What NIDANA tested',
    testedContent: 'It showed the question with the English term clarified in Odia.',
    probeResultTitle: 'Probe result: Correct',
    probeResultContent: 'You solved the Odia version correctly.',
    causeTitle: 'Verified cause',
    causeContent: 'English terminology friction. Your Physics concept was correct.',
    meansTitle: 'What this means',
    meansContent: 'With the Odia term clarified, you would likely have earned these 4 marks.',
    repairGapBtn: 'Repair terminology gap',

    mapTitle: 'Your learning map',
    mapSubtitle: 'Physics · Light and Optics',
    masteredLabel: 'Mastered',
    frictionLabel: 'Friction',
    gapsLabel: 'Gaps',
    lockedLabel: 'Locked',

    planTitle: 'Today’s quests',
    planSubtitle: '3 short tasks · about 22 minutes',
    completedQuestsBadge: 'completed',
    startFirstQuestBtn: 'Start first quest',

    offlineTitle: 'Offline mode',
    offlineSubtitle: 'Your mission pack is ready.',
    languageComfortHeading: 'Language Comfort Setting',
  },

  odia: {
    navHome: 'ମୂଳପୃଷ୍ଠା',
    navPractice: 'ଅଭ୍ୟାସ',
    navMap: 'ମାନଚିତ୍ର',
    navPlan: 'ଯୋଜନା',
    navProfile: 'ପ୍ରୋଫାଇଲ୍',

    appTitle: 'NIDANA',
    teamAttribution: 'Team MARGYN',
    offlineBadge: 'ଅଫଲାଇନ୍',
    xpLabel: 'XP',

    greeting: 'ନମସ୍କାର, Smita',
    homeSubtitle: 'ଆପଣଙ୍କର ପରବର୍ତ୍ତୀ ମାର୍କ ରିକଭରି ପ୍ରସ୍ତୁତ ଅଛି।',
    streakText: '୫ ଦିନ ଷ୍ଟ୍ରିକ୍ (5-day streak)',
    recoveryPoints: 'ରିକଭରି ପଏଣ୍ଟ (XP)',
    levelTitle: 'ସ୍ତର ୪: ମାର୍କ ଡିଟେକ୍ଟିଭ୍ (Mark Detective)',
    xpToNextLevel: 'ସ୍ତର ୫ ପାଇଁ ୮୦ XP ବାକି',
    recoverableMarksTitle: '୨୨ ମାର୍କ ପୁନରୁଦ୍ଧାର ଯୋଗ୍ୟ',
    recoverableMarksBreakdown: '୮ ମାର୍କ ଇଂରାଜୀ ଶବ୍ଦାବଳୀରୁ, ୬ ମାର୍କ ସମୟ ଚାପରୁ ଏବଂ ୮ ମାର୍କ ଧାରଣା ଅଭାବରୁ।',
    terminologyLoss: 'ଶବ୍ଦାବଳୀ (Terms)',
    pacingLoss: 'ସମୟ (Pacing)',
    conceptLoss: 'ଧାରଣା (Concepts)',
    viewReportLink: 'ବିସ୍ତୃତ ରିକଭରି ରିପୋର୍ଟ ଦେଖନ୍ତୁ',
    todaysMissionTag: 'ଆଜିର ମିଶନ',
    todaysMissionTitle: '୧୦ ମିନିଟର ପ୍ରତିସରଣ (Refraction) ଶବ୍ଦାବଳୀ ବ୍ରିଜ୍ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ।',
    todaysMissionDesc: 'ଭୌତିକ ବିଜ୍ଞାନ ଧାରଣାରେ ଦ୍ୱନ୍ଦ୍ୱ ନ ଉପୁଜାଇ ୮ଟି ଏଡ଼ାଇବା ଯୋଗ୍ୟ ମାର୍କ ଫେରିପାଇବା ପାଇଁ ଇଂରାଜୀ ଶବ୍ଦକୁ ଓଡ଼ିଆ ସହିତ ମିଳାନ୍ତୁ।',
    startMissionBtn: 'ଆଜିର ମିଶନ ଆରମ୍ଭ କରନ୍ତୁ',

    practiceTitle: 'ଏକ ମିଶନ ବାଛନ୍ତୁ',
    practiceSubtitle: 'ଆଜି ଆପଣ କ’ଣ ଉନ୍ନତ କରିବାକୁ ଚାହାନ୍ତି ବାଛନ୍ତୁ।',
    calmNotice: 'ଶାନ୍ତ ଶିକ୍ଷଣ ଖେଳ: ପ୍ରତ୍ୟେକ ମିଶନ ଏକ ନିର୍ଦ୍ଦିଷ୍ଟ କାରଣ (ଶବ୍ଦାବଳୀ, ବେଗ, ବା ଧାରଣା) ପୃଥକ କରେ, ଯାହାଦ୍ୱାରା ପରୀକ୍ଷା ଚାପ ବିନା ସ୍ପଷ୍ଟତା ମିଳେ।',

    questionMeta: 'ପ୍ରଶ୍ନ ୩ / ୫ (Question 3 of 5)',
    physicsRefraction: 'ପଦାର୍ଥ ବିଜ୍ଞାନ · ପ୍ରତିସରଣ (Physics · Refraction)',
    marksBadge: '୪ ମାର୍କ (4 marks)',
    flagBtn: 'ଚିହ୍ନଟ (Flag)',
    flaggedBtn: 'ଚିହ୍ନିତ (Flagged)',
    languageToggleBtn: 'English ରେ ଦେଖନ୍ତୁ',
    submitAnswerBtn: 'ଉତ୍ତର ଦାଖଲ କରନ୍ତୁ',
    selectOptionHint: 'ଦାଖଲ କରିବା ପାଇଁ ଉପରୋକ୍ତ ବିକଳ୍ପ ଚୟନ କରନ୍ତୁ',
    correctAnswerTitle: 'ସଠିକ୍ ଉତ୍ତର (Correct)',
    incorrectAnswerTitle: 'ଭୁଲ ଉତ୍ତର (Incorrect)',
    confidenceQuestion: 'ଏହି ଉତ୍ତର ଉପରେ ଆପଣଙ୍କର କେତେ ଆତ୍ମବିଶ୍ୱାସ ଥିଲା?',
    confidenceHint: 'ଆତ୍ମବିଶ୍ୱାସ ରେକର୍ଡ କରିବା ଦ୍ୱାରା NIDANA ଶବ୍ଦାବଳୀ ସମସ୍ୟା ଓ ଧାରଣା ଅସ୍ପଷ୍ଟତାକୁ ପୃଥକ କରିପାରେ।',
    lowConfidence: 'କମ୍ (Low)',
    mediumConfidence: 'ମଧ୍ୟମ (Medium)',
    highConfidence: 'ଅଧିକ (High)',
    continueToReportBtn: 'ମାର୍କ ରିକଭରି ରିପୋର୍ଟକୁ ଯାଆନ୍ତୁ',
    investigateWhyBtn: 'WHY Engine ରେ କାରଣ ଅନୁସନ୍ଧାନ କରନ୍ତୁ',

    reportTitle: 'ମାର୍କ ରିକଭରି ରିପୋର୍ଟ (Mark Recovery Report)',
    reportSubtitle: 'ଆପଣ ୨୮ ମାର୍କ ହରାଇଲେ। ୧୯ ମାର୍କ ପୁନରୁଦ୍ଧାର ଯୋଗ୍ୟ।',
    reportHeroBadge: 'ଯାଞ୍ଚ ହୋଇଥିବା ପୁନରୁଦ୍ଧାର ସମ୍ଭାବନା',
    reportHeroText: '୧୯ ମାର୍କ ପୁନରୁଦ୍ଧାର ଯୋଗ୍ୟ',
    reportHeroSubtitle: '୩ଟି ନିର୍ଦ୍ଦିଷ୍ଟ କ୍ଷେତ୍ରରେ ଏଡ଼ାଇବା ଯୋଗ୍ୟ ମାର୍କ କ୍ଷତି ଚିହ୍ନଟ ହୋଇଛି',
    reassurancePrefix: 'ଆଶ୍ୱାସନା: ',
    reassuranceText: 'ଆପଣଙ୍କର ପଦାର୍ଥ ବିଜ୍ଞାନ ବୁଝିବା ଶକ୍ତି ଆପଣଙ୍କ ସ୍କୋର ତୁଳନାରେ ଯଥେଷ୍ଟ ଅଧିକ ଦୃଢ଼।',
    verifiedCausesHeading: 'ମାର୍କ କ୍ଷତିର ଯାଞ୍ଚ ହୋଇଥିବା କାରଣ',
    startRecoveryPlanBtn: 'ରିକଭରି ଯୋଜନା ଆରମ୍ଭ କରନ୍ତୁ',
    inspectTraceBtn: 'WHY Engine ର ଯୁକ୍ତି ଅନୁସନ୍ଧାନ ଦେଖନ୍ତୁ',

    whyEngineTraceTag: 'WHY Engine ପ୍ରମାଣ ଟ୍ରେସ୍',
    whyTitle: 'ମୁଁ ଏହି ମାର୍କ କାହିଁକି ହରାଇଲି?',
    whyContext: 'ପ୍ରତିସରଣ (Refraction) · ୪ ମାର୍କ',
    avoidableLossNotice: 'ଏଡ଼ାଇବା ଯୋଗ୍ୟ ମାର୍କ କ୍ଷତି ଅନୁସନ୍ଧାନ',
    noticedTitle: 'NIDANA କ’ଣ ଲକ୍ଷ୍ୟ କଲା',
    noticedContent: 'ଆପଣ ୨୨ ସେକେଣ୍ଡ ପରେ ବିକଳ୍ପ B ଚୟନ କଲେ ଏବଂ କମ୍ ଆତ୍ମବିଶ୍ୱାସ ଜଣାଇଲେ।',
    testedTitle: 'NIDANA କ’ଣ ପରୀକ୍ଷା କଲା',
    testedContent: 'ଏହା ପ୍ରଶ୍ନଟିକୁ ଇଂରାଜୀ ଶବ୍ଦ ସହିତ ଓଡ଼ିଆରେ ସ୍ପଷ୍ଟ କରି ପରୀକ୍ଷା କଲା।',
    probeResultTitle: 'ପ୍ରୋବ୍ ଫଳାଫଳ: ସଠିକ୍',
    probeResultContent: 'ଆପଣ ଓଡ଼ିଆ ସଂସ୍କରଣଟିକୁ ସଠିକ୍ ଭାବରେ ସମାଧାନ କଲେ।',
    causeTitle: 'ପ୍ରମାଣିତ କାରଣ',
    causeContent: 'ଇଂରାଜୀ ଶବ୍ଦାବଳୀରେ ଘର୍ଷଣ। ଆପଣଙ୍କ ପଦାର୍ଥ ବିଜ୍ଞାନ ଧାରଣା ସମ୍ପୂର୍ଣ୍ଣ ସଠିକ୍ ଥିଲା।',
    meansTitle: 'ଏହାର ଅର୍ଥ କ’ଣ',
    meansContent: 'ଓଡ଼ିଆ ଶବ୍ଦଟି ସ୍ପଷ୍ଟ ହେବା ଦ୍ୱାରା, ଆପଣ ସମ୍ଭବତଃ ଏହି ୪ ମାର୍କ ପାଇପାରିଥାନ୍ତେ।',
    repairGapBtn: 'ଶବ୍ଦାବଳୀ ବ୍ୟବଧାନ ମରାମତି କରନ୍ତୁ',

    mapTitle: 'ଆପଣଙ୍କ ଶିକ୍ଷଣ ମାନଚିତ୍ର',
    mapSubtitle: 'ପଦାର୍ଥ ବିଜ୍ଞାନ · ଆଲୋକ ଓ ଦୃଷ୍ଟିବିଜ୍ଞାନ (Light & Optics)',
    masteredLabel: 'ଦକ୍ଷତା ପ୍ରାପ୍ତ',
    frictionLabel: 'ଘର୍ଷଣ (Friction)',
    gapsLabel: 'ବ୍ୟବଧାନ (Gaps)',
    lockedLabel: 'ଅବରୁଦ୍ଧ (Locked)',

    planTitle: 'ଆଜିର କ୍ୱେଷ୍ଟ୍ (Today’s quests)',
    planSubtitle: '୩ଟି ଛୋଟ କାର୍ଯ୍ୟ · ପ୍ରାୟ ୨୨ ମିନିଟ୍',
    completedQuestsBadge: 'ସମ୍ପନ୍ନ',
    startFirstQuestBtn: 'ପ୍ରଥମ କ୍ୱେଷ୍ଟ୍ ଆରମ୍ଭ କରନ୍ତୁ',

    offlineTitle: 'ଅଫଲାଇନ୍ ମୋଡ୍',
    offlineSubtitle: 'ଆପଣଙ୍କ ମିଶନ ପ୍ୟାକ୍ ପ୍ରସ୍ତୁତ ଅଛି।',
    languageComfortHeading: 'ଭାଷା ସୁବିଧା ସେଟିଂ (Language Setting)',
  },

  bilingual: {
    navHome: 'Home',
    navPractice: 'Practice',
    navMap: 'Map',
    navPlan: 'Plan',
    navProfile: 'Profile',

    appTitle: 'NIDANA',
    teamAttribution: 'Team MARGYN',
    offlineBadge: 'Offline · ଅଫଲାଇନ୍',
    xpLabel: 'XP',

    greeting: 'ନମସ୍କାର, Smita',
    homeSubtitle: 'Your next recovery is ready · ପରବର୍ତ୍ତୀ ରିକଭରି ପ୍ରସ୍ତୁତ।',
    streakText: '5-day streak · ୫ ଦିନ',
    recoveryPoints: 'Recovery Points · ରିକଭରି ପଏଣ୍ଟ',
    levelTitle: 'Level 4: Mark Detective · ସ୍ତର ୪',
    xpToNextLevel: '80 XP to Level 5',
    recoverableMarksTitle: '22 marks are recoverable (୨୨ ମାର୍କ)',
    recoverableMarksBreakdown: '8 from English terminology, 6 from time pressure, and 8 from concept gaps.',
    terminologyLoss: 'Terminology · ଶବ୍ଦାବଳୀ',
    pacingLoss: 'Pacing · ସମୟ',
    conceptLoss: 'Concepts · ଧାରଣା',
    viewReportLink: 'View detailed recovery report · ରିପୋର୍ଟ ଦେଖନ୍ତୁ',
    todaysMissionTag: "Today's mission · ଆଜିର ମିଶନ",
    todaysMissionTitle: 'Complete a 10-minute refraction terminology bridge.',
    todaysMissionDesc: 'Align English technical terms with Odia concepts to recover 8 avoidable marks without confusing physical principles.',
    startMissionBtn: "Start today’s mission · ମିଶନ ଆରମ୍ଭ କରନ୍ତୁ",

    practiceTitle: 'Choose a mission · ମିଶନ ବାଛନ୍ତୁ',
    practiceSubtitle: 'Pick what you want to improve today.',
    calmNotice: 'Calm learning game: Every mission isolates a specific variable—terminology, speed, or concepts—so you gain clarity without unnecessary exam pressure.',

    questionMeta: 'Question 3 of 5 · ପ୍ରଶ୍ନ ୩/୫',
    physicsRefraction: 'Physics · Refraction (ପ୍ରତିସରଣ)',
    marksBadge: '4 marks · ୪ ମାର୍କ',
    flagBtn: 'Flag',
    flaggedBtn: 'Flagged',
    languageToggleBtn: 'ଓଡ଼ିଆରେ ଦେଖନ୍ତୁ',
    submitAnswerBtn: 'Submit answer · ଦାଖଲ କରନ୍ତୁ',
    selectOptionHint: 'Select an option above to submit',
    correctAnswerTitle: 'Correct Answer · ସଠିକ୍ ଉତ୍ତର',
    incorrectAnswerTitle: 'Incorrect Answer · ଭୁଲ ଉତ୍ତର',
    confidenceQuestion: 'How confident were you? · ଆତ୍ମବିଶ୍ୱାସ କେତେ ଥିଲା?',
    confidenceHint: 'Capturing confidence helps NIDANA isolate language friction from concept uncertainty.',
    lowConfidence: 'Low · କମ୍',
    mediumConfidence: 'Medium · ମଧ୍ୟମ',
    highConfidence: 'High · ଅଧିକ',
    continueToReportBtn: 'Continue to Mark Recovery Report',
    investigateWhyBtn: 'Investigate this mark loss in WHY Engine',

    reportTitle: 'Mark Recovery Report · ରିକଭରି ରିପୋର୍ଟ',
    reportSubtitle: 'You lost 28 marks. 19 are recoverable.',
    reportHeroBadge: 'Verified Recovery Potential',
    reportHeroText: '19 marks recoverable',
    reportHeroSubtitle: 'Avoidable loss identified across 3 targeted areas',
    reassurancePrefix: 'Reassurance: ',
    reassuranceText: 'Your Physics understanding is stronger than your score suggests.',
    verifiedCausesHeading: 'Verified causes of lost marks',
    startRecoveryPlanBtn: 'Start recovery plan · ଯୋଜନା ଆରମ୍ଭ କରନ୍ତୁ',
    inspectTraceBtn: 'See WHY Engine reasoning trace',

    whyEngineTraceTag: 'WHY Engine Evidence Trace',
    whyTitle: 'Why did I lose this mark? · କାହିଁକି ମାର୍କ ଗଲା?',
    whyContext: 'Refraction (ପ୍ରତିସରଣ) · 4 marks',
    avoidableLossNotice: 'Avoidable mark loss investigation',
    noticedTitle: 'What NIDANA noticed',
    noticedContent: 'You selected option B after 22 seconds and reported low confidence.',
    testedTitle: 'What NIDANA tested',
    testedContent: 'It showed the question with the English term clarified in Odia.',
    probeResultTitle: 'Probe result: Correct',
    probeResultContent: 'You solved the Odia version correctly.',
    causeTitle: 'Verified cause',
    causeContent: 'English terminology friction. Your Physics concept was correct.',
    meansTitle: 'What this means',
    meansContent: 'With the Odia term clarified, you would likely have earned these 4 marks.',
    repairGapBtn: 'Repair terminology gap · ମରାମତି କରନ୍ତୁ',

    mapTitle: 'Your learning map · ଶିକ୍ଷଣ ମାନଚିତ୍ର',
    mapSubtitle: 'Physics · Light and Optics',
    masteredLabel: 'Mastered',
    frictionLabel: 'Friction',
    gapsLabel: 'Gaps',
    lockedLabel: 'Locked',

    planTitle: 'Today’s quests · ଆଜିର କ୍ୱେଷ୍ଟ୍',
    planSubtitle: '3 short tasks · about 22 minutes',
    completedQuestsBadge: 'completed',
    startFirstQuestBtn: 'Start first quest · ଆରମ୍ଭ କରନ୍ତୁ',

    offlineTitle: 'Offline mode · ଅଫଲାଇନ୍ ମୋଡ୍',
    offlineSubtitle: 'Your mission pack is ready.',
    languageComfortHeading: 'Language Comfort Setting',
  },
};
