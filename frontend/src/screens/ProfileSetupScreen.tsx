import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import { ProfileSetupData } from '../types';

interface ProfileSetupScreenProps {
  onComplete: (data: ProfileSetupData) => void;
  onBack?: () => void;
  initialValues?: Partial<ProfileSetupData>;
}

const CLASS_OPTIONS = [
  'Class 9',
  'Class 10',
  'Class 12',
] as const;

export type LearningLanguageId = 'Odia' | 'English' | 'Hindi';

interface LanguageOption {
  id: LearningLanguageId;
  label: string;
  nativeScript?: string;
  scriptFont?: string;
  ariaLabel: string;
  illustrationPath: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'Odia',
    label: 'Odia',
    nativeScript: '(ଓଡ଼ିଆ)',
    scriptFont: 'font-odia',
    ariaLabel: 'Odia (ଓଡ଼ିଆ)',
    illustrationPath: '/icons/temple-1.svg',
  },
  {
    id: 'English',
    label: 'English',
    nativeScript: 'English',
    ariaLabel: 'English',
    illustrationPath: '/icons/ancient-scroll.svg',
  },
  {
    id: 'Hindi',
    label: 'Hindi',
    nativeScript: '(हिन्दी)',
    ariaLabel: 'Hindi (हिन्दी)',
    illustrationPath: '/icons/building.svg',
  },
];

const normalizeLanguageValue = (val: string): LearningLanguageId | null => {
  if (val.startsWith('Odia')) return 'Odia';
  if (val.startsWith('Hindi')) return 'Hindi';
  if (val.startsWith('English')) return 'English';
  return null;
};

export const isAllowedClass = (val: string): boolean => {
  const trimmed = val.trim();
  return (
    trimmed === 'Class 9' ||
    trimmed === 'Class 10' ||
    trimmed === 'Class 12' ||
    trimmed === '9' ||
    trimmed === '10' ||
    trimmed === '12'
  );
};

export const parseClassLevel = (val: string): 9 | 10 | 12 => {
  const trimmed = val.trim();
  if (trimmed === '9' || trimmed === 'Class 9') return 9;
  if (trimmed === '10' || trimmed === 'Class 10') return 10;
  return 12;
};

export const validateName = (rawName: string): { isValid: boolean; error?: string } => {
  const trimmed = rawName.trim();
  if (trimmed === '') {
    return { isValid: false, error: 'Please enter your name.' };
  }
  return { isValid: true };
};

export const validateAge = (rawAge: string): { isValid: boolean; error?: string } => {
  const trimmed = rawAge.trim();
  if (trimmed === '') {
    return { isValid: false, error: 'Please enter your age.' };
  }
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid whole-number age.' };
  }
  return { isValid: true };
};

export const validateClass = (rawClass: string): { isValid: boolean; error?: string } => {
  const trimmed = rawClass.trim();
  if (!trimmed || trimmed === 'Select your class' || !isAllowedClass(trimmed)) {
    return { isValid: false, error: 'Please select your class.' };
  }
  return { isValid: true };
};

export const validateLanguages = (
  languages: LearningLanguageId[]
): { isValid: boolean; error?: string } => {
  if (languages.length === 0) {
    return { isValid: false, error: 'Please select at least one language.' };
  }
  if (languages.length > 2) {
    return { isValid: false, error: 'You can choose a maximum of two languages.' };
  }
  const allowed = new Set<LearningLanguageId>(['Odia', 'English', 'Hindi']);
  const distinct = new Set(languages);
  if (distinct.size !== languages.length) {
    return { isValid: false, error: 'Duplicate language values are not allowed.' };
  }
  for (const lang of languages) {
    if (!allowed.has(lang)) {
      return { isValid: false, error: 'Please select a valid language.' };
    }
  }
  return { isValid: true };
};

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onComplete,
  onBack,
  initialValues,
}) => {
  const [name, setName] = useState<string>(() => initialValues?.name || '');
  const [age, setAge] = useState<string>(() =>
    initialValues?.age !== undefined && initialValues?.age !== null
      ? String(initialValues.age)
      : ''
  );
  const [studentClass, setStudentClass] = useState<string>(() =>
    initialValues?.studentClass || ''
  );
  const [selectedLanguages, setSelectedLanguages] = useState<LearningLanguageId[]>(() => {
    if (!initialValues?.learningLanguages) return [];
    const normalized = initialValues.learningLanguages
      .map(normalizeLanguageValue)
      .filter((l): l is LearningLanguageId => l !== null);
    return Array.from(new Set(normalized)).slice(0, 2);
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    age?: string;
    studentClass?: string;
    languages?: string;
  }>({});

  const [showFormLevelAlert, setShowFormLevelAlert] = useState<boolean>(false);
  const [languageLimitNotice, setLanguageLimitNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const topAlertRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const ageInputRef = useRef<HTMLInputElement>(null);
  const classSelectRef = useRef<HTMLSelectElement>(null);
  const languagesSectionRef = useRef<HTMLDivElement>(null);
  const firstLanguageButtonRef = useRef<HTMLButtonElement>(null);

  const checkAllValid = useCallback((): boolean => {
    return (
      validateName(name).isValid &&
      validateAge(age).isValid &&
      validateClass(studentClass).isValid &&
      validateLanguages(selectedLanguages).isValid
    );
  }, [name, age, studentClass, selectedLanguages]);

  useEffect(() => {
    if (showFormLevelAlert) {
      if (checkAllValid()) {
        setShowFormLevelAlert(false);
      }
    }
  }, [name, age, studentClass, selectedLanguages, showFormLevelAlert, checkAllValid]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (fieldErrors.name && validateName(val).isValid) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAge(val);
    if (fieldErrors.age && validateAge(val).isValid) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.age;
        return next;
      });
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStudentClass(val);
    if (fieldErrors.studentClass && validateClass(val).isValid) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.studentClass;
        return next;
      });
    }
  };

  const handleToggleLanguage = (langId: LearningLanguageId) => {
    setLanguageLimitNotice(null);

    setSelectedLanguages((prev) => {
      const alreadySelected = prev.includes(langId);

      if (alreadySelected) {
        const updated = prev.filter((l) => l !== langId);
        if (updated.length > 0 && fieldErrors.languages) {
          setFieldErrors((curr) => {
            const next = { ...curr };
            delete next.languages;
            return next;
          });
        }
        return updated;
      }

      if (prev.length >= 2) {
        setLanguageLimitNotice('You can choose a maximum of two languages.');
        return prev;
      }

      const updated = Array.from(new Set([...prev, langId]));
      if (fieldErrors.languages) {
        setFieldErrors((curr) => {
          const next = { ...curr };
          delete next.languages;
          return next;
        });
      }
      return updated;
    });
  };

  const handleFocusField = (e: React.FocusEvent<HTMLElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nameResult = validateName(name);
    const ageResult = validateAge(age);
    const classResult = validateClass(studentClass);
    const langResult = validateLanguages(selectedLanguages);

    const errors: {
      name?: string;
      age?: string;
      studentClass?: string;
      languages?: string;
    } = {};

    if (!nameResult.isValid && nameResult.error) errors.name = nameResult.error;
    if (!ageResult.isValid && ageResult.error) errors.age = ageResult.error;
    if (!classResult.isValid && classResult.error) errors.studentClass = classResult.error;
    if (!langResult.isValid && langResult.error) errors.languages = langResult.error;

    if (Object.keys(errors).length > 0) {
      setShowFormLevelAlert(true);
      setFieldErrors(errors);

      if (errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.age && ageInputRef.current) {
        ageInputRef.current.focus();
        ageInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.studentClass && classSelectRef.current) {
        classSelectRef.current.focus();
        classSelectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.languages) {
        firstLanguageButtonRef.current?.focus();
        languagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (topAlertRef.current) {
        topAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setIsSubmitting(true);
    setShowFormLevelAlert(false);
    setFieldErrors({});

    const normalizedClass = (
      studentClass.startsWith('Class ') ? studentClass.trim() : `Class ${studentClass.trim()}`
    ) as 'Class 9' | 'Class 10' | 'Class 12';
    const classNum = parseClassLevel(normalizedClass);

    onComplete({
      name: name.trim(),
      age: parseInt(age.trim(), 10),
      studentClass: normalizedClass,
      classLevel: classNum,
      learningLanguages: selectedLanguages,
    });
  };

  return (
    <div className="w-full max-w-[430px] min-w-0 min-h-screen mx-auto bg-[#F3E7D2] text-[#191817] flex flex-col border-x border-[#CBB99E]/80 shadow-2xl relative overflow-x-hidden font-operational selection:bg-[#FBEAE3] selection:text-[#A94F32]">
      
      <div className="relative w-full overflow-hidden bg-[#E2D5C3]">
        
        <div className="absolute top-0 inset-x-0 z-20 px-4 sm:px-5 pt-3.5 pb-3 flex items-center justify-between bg-gradient-to-b from-[#191817]/60 via-[#191817]/30 to-transparent">
          
          <button
            type="button"
            onClick={onBack || (() => { if (typeof window !== 'undefined') window.location.hash = '#home'; })}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-85 transition-opacity select-none group"
            title="Go to Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#A94F32] flex items-center justify-center text-white font-source-serif font-bold text-base shadow-sm ring-1 ring-[#D99A2B]/40 shrink-0 group-hover:bg-[#8F3E24] transition-colors">
              N
            </div>
            <div className="min-w-0">
              <span className="font-source-serif font-bold text-base tracking-tight text-white block leading-none truncate drop-shadow-sm group-hover:underline">
                NIDANA
              </span>
              <span className="text-[9px] text-[#E4E0D8] font-operational uppercase tracking-[0.2em] block leading-tight mt-0.5 truncate font-medium drop-shadow-xs">
                TEAM MARGYN
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0 opacity-90 text-white" aria-hidden="true">
            <div className="w-2 h-2 rotate-45 bg-[#D99A2B]" />
            <div className="w-5 h-px bg-white/60" />
            <div className="w-2 h-2 rotate-45 bg-[#A94F32]" />
          </div>
        </div>

        <picture className="w-full block">
          <source srcSet="/assets/preq-header.webp" type="image/webp" />
          <img
            src="/assets/preq-header.png"
            alt="Classical Mediterranean landscape with Greek temple and sea"
            className="w-full h-48 sm:h-56 object-cover object-bottom block"
          />
        </picture>

        <div className="relative -mt-4 w-full overflow-hidden leading-none z-10 pointer-events-none" aria-hidden="true">
          <svg
            viewBox="0 0 1200 32"
            preserveAspectRatio="none"
            className="w-full h-4 sm:h-5 text-[#F3E7D2] fill-current drop-shadow-xs"
          >
            <path d="M0,0 Q60,18 130,8 Q200,24 280,10 Q360,20 440,6 Q520,24 600,12 Q680,26 760,10 Q840,22 920,8 Q1000,24 1080,12 Q1140,20 1200,6 L1200,32 L0,32 Z" />
          </svg>
        </div>
      </div>

      <div className="w-full px-4 sm:px-5 pt-1.5 pb-2 relative z-10">
        <h1 className="sr-only">Learning Profile Setup</h1>
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#CBB99E] to-[#CBB99E] relative">
            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-[#A94F32] text-[8px] leading-none">▸</span>
          </div>
          <span className="text-[10px] font-operational font-semibold uppercase tracking-[0.25em] text-[#A94F32] px-1 shrink-0">
            ODYSSEY SETUP
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#CBB99E] to-[#CBB99E] relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-[#A94F32] text-[8px] leading-none">◂</span>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-5 pt-0 pb-12 sm:pb-16 overflow-y-auto relative z-10">
        
        <svg
          className="absolute top-10 right-2 w-24 h-24 text-[#C69A4B]/20 pointer-events-none select-none z-0"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="44" strokeWidth="0.75" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="38" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="16" strokeWidth="0.5" />
          <path d="M50 6 L55 45 L94 50 L55 55 L50 94 L45 55 L6 50 L45 45 Z" fill="currentColor" fillOpacity="0.08" strokeWidth="0.75" />
          <path d="M50 6 L50 94 M6 50 L94 50" strokeWidth="0.6" />
          <polygon points="50,6 54,46 50,50" fill="currentColor" fillOpacity="0.18" />
          <polygon points="94,50 54,54 50,50" fill="currentColor" fillOpacity="0.18" />
          <polygon points="50,94 46,54 50,50" fill="currentColor" fillOpacity="0.18" />
          <polygon points="6,50 46,46 50,50" fill="currentColor" fillOpacity="0.18" />
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </svg>

        <svg
          className="absolute top-2 -left-2 w-9 h-36 text-[#77785B]/20 pointer-events-none select-none z-0"
          viewBox="0 0 40 100"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M20 95 Q15 65 22 35 T20 5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 75 Q10 70 8 62 Q15 64 20 75" fill="currentColor" fillOpacity="0.15" strokeWidth="0.8" />
          <path d="M21 65 Q30 58 32 50 Q25 54 21 65" fill="currentColor" fillOpacity="0.15" strokeWidth="0.8" />
          <path d="M20 50 Q12 44 10 36 Q17 40 20 50" fill="currentColor" fillOpacity="0.15" strokeWidth="0.8" />
          <path d="M22 38 Q30 30 31 22 Q25 26 22 38" fill="currentColor" fillOpacity="0.15" strokeWidth="0.8" />
          <path d="M20 22 Q14 16 13 8 Q18 12 20 22" fill="currentColor" fillOpacity="0.15" strokeWidth="0.8" />
        </svg>

        {showFormLevelAlert && (
          <div
            ref={topAlertRef}
            role="alert"
            aria-live="polite"
            className="mb-4 p-3.5 sm:p-4 rounded-xl bg-[#FBE8E5] border border-[#B3402F]/40 text-[#B3402F] animate-calm-fade-in shadow-xs relative z-10"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#B3402F] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="font-operational font-semibold text-xs sm:text-sm text-[#B3402F] leading-snug break-words">
                  Please complete all required fields before continuing.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 relative z-10">
          
          <div className="space-y-1.5 scroll-mt-6 sm:scroll-mt-8">
            <div className="flex items-center gap-2">
              <picture className="w-4 h-4 shrink-0 block">
                <source srcSet="/assets/odyssey/icon-pillar.webp" type="image/webp" />
                <img
                  src="/assets/odyssey/icon-pillar.png"
                  alt=""
                  className="w-4 h-4 object-contain mix-blend-multiply"
                  aria-hidden="true"
                />
              </picture>
              <label
                htmlFor="student-name"
                className="block font-operational text-xs font-bold uppercase tracking-wider text-[#191817]"
              >
                NAME <span className="text-[#A94F32]" aria-hidden="true">*</span>
              </label>
            </div>

            <div className="relative">
              <input
                ref={nameInputRef}
                id="student-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={handleNameChange}
                onFocus={handleFocusField}
                placeholder="Enter your full name"
                className={`w-full min-h-[52px] h-[54px] px-4 py-3 bg-[#F8F2E7] text-[#191817] placeholder:text-[#8C877E] font-operational text-[16px] sm:text-sm rounded-2xl border transition-all duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A94F32] shadow-2xs ${
                  fieldErrors.name
                    ? 'border-[#B3402F] ring-1 ring-[#B3402F]/40 bg-[#FBE8E5]/30'
                    : 'border-[#CBB99E] focus:border-[#A94F32] focus:ring-2 focus:ring-[#FBEAE3]'
                }`}
                aria-required="true"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
            </div>
            {fieldErrors.name && (
              <p
                id="name-error"
                role="alert"
                className="font-operational text-xs text-[#B3402F] mt-1 pl-0.5 flex items-start gap-1.5 animate-calm-fade-in break-words leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B3402F] shrink-0 mt-1" aria-hidden="true" />
                <span className="flex-1">{fieldErrors.name}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5 scroll-mt-6 sm:scroll-mt-8">
            <div className="flex items-center gap-2">
              <picture className="w-4 h-4 shrink-0 block">
                <source srcSet="/assets/odyssey/icon-helmet.webp" type="image/webp" />
                <img
                  src="/assets/odyssey/icon-helmet.png"
                  alt=""
                  className="w-4 h-4 object-contain mix-blend-multiply"
                  aria-hidden="true"
                />
              </picture>
              <label
                htmlFor="student-age"
                className="block font-operational text-xs font-bold uppercase tracking-wider text-[#191817]"
              >
                AGE <span className="text-[#A94F32]" aria-hidden="true">*</span>
              </label>
            </div>

            <div className="relative">
              <input
                ref={ageInputRef}
                id="student-age"
                name="age"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={age}
                onChange={handleAgeChange}
                onFocus={handleFocusField}
                placeholder="Enter your age"
                className={`w-full min-h-[52px] h-[54px] px-4 py-3 bg-[#F8F2E7] text-[#191817] placeholder:text-[#8C877E] font-operational text-[16px] sm:text-sm rounded-2xl border transition-all duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A94F32] shadow-2xs ${
                  fieldErrors.age
                    ? 'border-[#B3402F] ring-1 ring-[#B3402F]/40 bg-[#FBE8E5]/30'
                    : 'border-[#CBB99E] focus:border-[#A94F32] focus:ring-2 focus:ring-[#FBEAE3]'
                }`}
                aria-required="true"
                aria-invalid={!!fieldErrors.age}
                aria-describedby={fieldErrors.age ? 'age-error' : undefined}
              />
            </div>
            {fieldErrors.age && (
              <p
                id="age-error"
                role="alert"
                className="font-operational text-xs text-[#B3402F] mt-1 pl-0.5 flex items-start gap-1.5 animate-calm-fade-in break-words leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B3402F] shrink-0 mt-1" aria-hidden="true" />
                <span className="flex-1">{fieldErrors.age}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5 scroll-mt-6 sm:scroll-mt-8">
            <div className="flex items-center gap-2">
              <picture className="w-4 h-4 shrink-0 block">
                <source srcSet="/assets/odyssey/icon-class-pillar.webp" type="image/webp" />
                <img
                  src="/assets/odyssey/icon-class-pillar.png"
                  alt=""
                  className="w-4 h-4 object-contain mix-blend-multiply"
                  aria-hidden="true"
                />
              </picture>
              <label
                htmlFor="student-class"
                className="block font-operational text-xs font-bold uppercase tracking-wider text-[#191817]"
              >
                CLASS <span className="text-[#A94F32]" aria-hidden="true">*</span>
              </label>
            </div>

            <div className="relative">
              <select
                ref={classSelectRef}
                id="student-class"
                name="studentClass"
                value={studentClass}
                onChange={handleClassChange}
                onFocus={handleFocusField}
                className={`w-full min-h-[52px] h-[54px] px-4 py-3 pr-10 bg-[#F8F2E7] font-operational text-[16px] sm:text-sm rounded-2xl border appearance-none transition-all duration-150 cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A94F32] shadow-2xs ${
                  studentClass ? 'text-[#191817]' : 'text-[#8C877E]'
                } ${
                  fieldErrors.studentClass
                    ? 'border-[#B3402F] ring-1 ring-[#B3402F]/40 bg-[#FBE8E5]/30'
                    : 'border-[#CBB99E] focus:border-[#A94F32] focus:ring-2 focus:ring-[#FBEAE3]'
                }`}
                aria-required="true"
                aria-invalid={!!fieldErrors.studentClass}
                aria-describedby={fieldErrors.studentClass ? 'class-error' : undefined}
              >
                <option value="" disabled>
                  Select your class
                </option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls} className="text-[#191817]">
                    {cls}
                  </option>
                ))}
              </select>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#68645E]"
                aria-hidden="true"
              >
                <ChevronDown className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
            {fieldErrors.studentClass && (
              <p
                id="class-error"
                role="alert"
                className="font-operational text-xs text-[#B3402F] mt-1 pl-0.5 flex items-start gap-1.5 animate-calm-fade-in break-words leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B3402F] shrink-0 mt-1" aria-hidden="true" />
                <span className="flex-1">{fieldErrors.studentClass}</span>
              </p>
            )}
          </div>

          <div
            ref={languagesSectionRef}
            className="space-y-1.5 pt-1 scroll-mt-6 sm:scroll-mt-8"
            role="group"
            aria-labelledby="languages-label"
            aria-describedby={fieldErrors.languages ? 'languages-error' : undefined}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <picture className="w-4 h-3.5 shrink-0 block">
                    <source srcSet="/assets/odyssey/icon-book.webp" type="image/webp" />
                    <img
                      src="/assets/odyssey/icon-book.png"
                      alt=""
                      className="w-4 h-3.5 object-contain mix-blend-multiply"
                      aria-hidden="true"
                    />
                  </picture>
                  <span
                    id="languages-label"
                    className="block font-operational text-xs font-bold uppercase tracking-wider text-[#191817]"
                  >
                    CHOOSE YOUR LEARNING LANGUAGES <span className="text-[#A94F32]" aria-hidden="true">*</span>
                  </span>
                </div>

                <span
                  className="text-xs font-operational font-semibold text-[#0E7C7B] shrink-0"
                  aria-live="polite"
                >
                  {selectedLanguages.length}/2 selected
                </span>
              </div>

              <div className="min-h-[20px] flex items-center mt-0.5">
                {languageLimitNotice ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className="font-operational text-xs text-[#A94F32] font-semibold flex items-center gap-1.5 animate-calm-fade-in leading-snug"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#A94F32]" aria-hidden="true" />
                    <span>{languageLimitNotice}</span>
                  </p>
                ) : (
                  <p className="font-operational text-xs text-[#68645E] leading-snug">
                    Choose one or two languages. You can learn bilingually.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {LANGUAGE_OPTIONS.map((opt, idx) => {
                const isSelected = selectedLanguages.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    ref={idx === 0 ? firstLanguageButtonRef : undefined}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={opt.ariaLabel}
                    onClick={() => handleToggleLanguage(opt.id)}
                    className={`min-h-[114px] sm:min-h-[122px] p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A94F32] active:scale-[0.98] touch-manipulation relative shadow-2xs ${
                      isSelected
                        ? 'bg-[#FBEAE3] border-[#A94F32] ring-1 ring-[#A94F32]/40 shadow-xs'
                        : fieldErrors.languages
                        ? 'bg-[#F8F2E7] border-[#B3402F]/60 hover:bg-[#F3EBDD]'
                        : 'bg-[#F8F2E7] border-[#CBB99E] hover:bg-[#F3EBDD] hover:border-[#A94F32]/50'
                    }`}
                  >
                    
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-[#A94F32] text-white shadow-2xs'
                            : 'border-[1.5px] border-[#CBB99E] bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A94F32]" aria-hidden="true" />
                      )}
                    </div>

                    <div className="my-1 flex items-center justify-center w-full h-11 shrink-0">
                      {opt.id === 'English' ? (
                        <img
                          src="/icons/ancient-scroll.svg"
                          alt=""
                          className="h-full max-h-11 w-auto object-contain transition-transform duration-150 drop-shadow-2xs"
                          aria-hidden="true"
                        />
                      ) : opt.id === 'Hindi' ? (
                        <img
                          src="/icons/building.svg"
                          alt=""
                          className="h-full max-h-11 w-auto object-contain transition-transform duration-150 drop-shadow-2xs"
                          aria-hidden="true"
                        />
                      ) : (
                        <img
                          src="/icons/temple-1.svg"
                          alt=""
                          className="h-full max-h-11 w-auto object-contain transition-transform duration-150 drop-shadow-2xs"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="w-full text-left min-w-0">
                      <span
                        className={`font-operational text-xs sm:text-[13px] block truncate leading-tight ${
                          isSelected
                            ? 'font-bold text-[#191817]'
                            : 'font-semibold text-[#191817]'
                        }`}
                      >
                        {opt.label}
                      </span>
                      {opt.nativeScript && opt.nativeScript !== opt.label ? (
                        <span
                          className={`text-[11px] text-[#68645E] block truncate mt-0.5 leading-tight ${
                            opt.scriptFont || ''
                          }`}
                        >
                          {opt.nativeScript}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#68645E] block truncate mt-0.5 leading-tight">
                          English
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {fieldErrors.languages && (
              <p
                id="languages-error"
                role="alert"
                className="font-operational text-xs text-[#B3402F] mt-1 pl-0.5 flex items-start gap-1.5 animate-calm-fade-in break-words leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B3402F] shrink-0 mt-1" aria-hidden="true" />
                <span className="flex-1">{fieldErrors.languages}</span>
              </p>
            )}
          </div>

          <div className="pt-4 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] h-[54px] px-6 rounded-2xl bg-[#A94F32] hover:bg-[#8F3E24] active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait text-[#F8F2E7] font-source-serif font-medium text-lg tracking-wide shadow-xs hover:shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A94F32] touch-manipulation relative overflow-hidden"
            >
              
              <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none opacity-25" aria-hidden="true">
                <svg className="w-10 h-5 text-[#F8F2E7]" viewBox="0 0 50 20" fill="currentColor">
                  <path d="M5,10 Q15,4 25,10 Q35,16 45,10" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <ellipse cx="12" cy="7" rx="4" ry="2" transform="rotate(-20 12 7)" />
                  <ellipse cx="22" cy="7" rx="4" ry="2" transform="rotate(-15 22 7)" />
                  <ellipse cx="32" cy="7" rx="4" ry="2" transform="rotate(-10 32 7)" />
                  <ellipse cx="18" cy="13" rx="4" ry="2" transform="rotate(20 18 13)" />
                  <ellipse cx="28" cy="13" rx="4" ry="2" transform="rotate(15 28 13)" />
                  <ellipse cx="38" cy="13" rx="4" ry="2" transform="rotate(10 38 13)" />
                </svg>
              </div>

              <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none opacity-25" aria-hidden="true">
                <svg className="w-10 h-5 text-[#F8F2E7] scale-x-[-1]" viewBox="0 0 50 20" fill="currentColor">
                  <path d="M5,10 Q15,4 25,10 Q35,16 45,10" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <ellipse cx="12" cy="7" rx="4" ry="2" transform="rotate(-20 12 7)" />
                  <ellipse cx="22" cy="7" rx="4" ry="2" transform="rotate(-15 22 7)" />
                  <ellipse cx="32" cy="7" rx="4" ry="2" transform="rotate(-10 32 7)" />
                  <ellipse cx="18" cy="13" rx="4" ry="2" transform="rotate(20 18 13)" />
                  <ellipse cx="28" cy="13" rx="4" ry="2" transform="rotate(15 28 13)" />
                  <ellipse cx="38" cy="13" rx="4" ry="2" transform="rotate(10 38 13)" />
                </svg>
              </div>

              <span className="relative z-10 flex items-center gap-2">
                <span>{isSubmitting ? 'Continuing...' : 'Continue'}</span>
                {!isSubmitting && <span className="font-operational text-base">→</span>}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center" aria-hidden="true">
          <p className="text-[11px] font-operational text-[#68645E]">
            NIDANA adapts questions to bridge gaps between Odia & English.
          </p>
        </div>
      </main>
    </div>
  );
};
