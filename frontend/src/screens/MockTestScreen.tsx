import React, { useState, useEffect } from 'react';
import { Clock, Bookmark, Languages, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { sampleMockQuestion } from '../data/mockData';
import { AnswerOption } from '../components/AnswerOption';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenId } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MockTestScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onQuestionCompleted?: (isCorrect: boolean, confidence: 'low' | 'medium' | 'high') => void;
}

export const MockTestScreen: React.FC<MockTestScreenProps> = ({
  onNavigate,
  onQuestionCompleted,
}) => {
  const { languageMode, setLanguageMode, t } = useLanguage();
  const isOdia = languageMode === 'odia' || languageMode === 'bilingual';

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isFlagged, setIsFlagged] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high' | null>(null);
  
  const [secondsRemaining, setSecondsRemaining] = useState<number>(138);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    if (!isTimerRunning || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQuestion = sampleMockQuestion;
  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

  const options = isOdia ? currentQuestion.optionsOd : currentQuestion.optionsEn;
  const questionText = isOdia ? currentQuestion.questionTextOd : currentQuestion.questionTextEn;
  const explanation = isOdia ? currentQuestion.explanationOd : currentQuestion.explanationEn;

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
    setIsTimerRunning(false);
  };

  const handleConfidenceSelect = (level: 'low' | 'medium' | 'high') => {
    setConfidence(level);
    if (onQuestionCompleted) {
      onQuestionCompleted(isCorrect, level);
    }
  };

  const toggleMockLanguage = () => {
    setLanguageMode(languageMode === 'odia' ? 'english' : 'odia');
  };

  return (
    <div className="space-y-4 pb-8">
      
      <div className="flex items-center justify-between gap-2 pt-1 pb-1">
        <div className="text-xs font-semibold text-[#191817] bg-white px-3 py-1.5 rounded-full border border-[#E4E0D8] shadow-2xs font-ui">
          {t.questionMeta}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#191817] bg-white px-3 py-1.5 rounded-full border border-[#E4E0D8] shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#C96442]" aria-hidden="true" />
          <span className="tabular-nums">{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#6B6A67] px-0.5 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <span className="font-semibold text-[#0E7C7B]">
            {isOdia ? 'ପଦାର୍ଥ ବିଜ୍ଞାନ (Physics)' : 'Physics'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">
            {isOdia ? 'ପ୍ରତିସରଣ (Refraction)' : 'Refraction'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#191817] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E4E0D8] shrink-0 font-mono">
            {t.marksBadge}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsFlagged(!isFlagged)}
            className={`min-h-[36px] px-2.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
              isFlagged
                ? 'bg-[#FFF4D6] border-[#D99A2B] text-[#A66F0D]'
                : 'border-[#E4E0D8] text-[#6B6A67] hover:bg-white'
            }`}
            title="Flag question for review"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFlagged ? t.flaggedBtn : t.flagBtn}</span>
          </button>

          <button
            type="button"
            onClick={toggleMockLanguage}
            className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-medium text-[#0E7C7B] bg-[#E3F2F1] hover:bg-[#d5ebea] px-3 py-1 rounded-full border border-[#0E7C7B]/30 transition-colors cursor-pointer select-none"
            title="Toggle language without resetting progress"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-odia">
              {languageMode === 'odia' ? 'English ରେ ଦେଖନ୍ତୁ' : 'ଓଡ଼ିଆରେ ଦେଖନ୍ତୁ'}
            </span>
          </button>
        </div>
      </div>

      <Card className="p-5 border border-[#E4E0D8] shadow-xs">
        <h2 className="text-[17px] font-ui font-medium text-[#191817] leading-relaxed break-words">
          {questionText}
        </h2>
      </Card>

      <div className="space-y-2.5">
        {options.map((opt) => (
          <AnswerOption
            key={opt.id}
            letter={opt.id}
            text={opt.text}
            isSelected={selectedOptionId === opt.id}
            isSubmitted={isSubmitted}
            isCorrect={opt.id === currentQuestion.correctOptionId}
            disabled={isSubmitted}
            onClick={() => {
              if (!isSubmitted) {
                setSelectedOptionId(opt.id);
              }
            }}
          />
        ))}
      </div>

      {!isSubmitted ? (
        <div className="pt-2">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedOptionId}
            onClick={handleSubmit}
            className="text-base font-semibold shadow-xs"
          >
            {t.submitAnswerBtn}
          </Button>
          {!selectedOptionId && (
            <p className="text-center text-xs text-[#6B6A67] mt-2">
              {t.selectOptionHint}
            </p>
          )}
        </div>
      ) : (
        
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          
          <Card
            variant={isCorrect ? 'soft-green' : 'soft-brand'}
            className="p-4 border"
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <div className="w-7 h-7 rounded-full bg-[#2F7D4F] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#B3402F] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isCorrect
                        ? 'bg-[#2F7D4F] text-white'
                        : 'bg-[#B3402F] text-white'
                    }`}
                  >
                    {isCorrect ? t.correctAnswerTitle : t.incorrectAnswerTitle}
                  </span>
                  <span className="text-xs text-[#6B6A67] font-medium">
                    {isOdia ? 'ସଠିକ୍ ବିକଳ୍ପ: B (ପ୍ରତିସରଣ)' : 'Correct option: B (Refraction)'}
                  </span>
                </div>
                <p className="text-xs text-[#191817] leading-relaxed break-words font-ui">
                  {explanation}
                </p>
              </div>
            </div>
          </Card>

          <div className="p-4 bg-white rounded-[14px] border border-[#E4E0D8]">
            <span className="text-xs font-semibold text-[#191817] block mb-1">
              {t.confidenceQuestion}
            </span>
            <p className="text-[11px] text-[#6B6A67] mb-2.5">
              {t.confidenceHint}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: t.lowConfidence },
                { id: 'medium', label: t.mediumConfidence },
                { id: 'high', label: t.highConfidence },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleConfidenceSelect(item.id as any)}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    confidence === item.id
                      ? 'bg-[#C96442] text-white border-[#C96442] shadow-xs'
                      : 'bg-[#F7F5F0] text-[#191817] border-[#E4E0D8] hover:border-[#C96442]/40 active:scale-[0.98]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 space-y-2">
            <Button
              fullWidth
              size="lg"
              onClick={() => onNavigate('report')}
              className="text-base font-semibold shadow-xs"
            >
              <span>{t.continueToReportBtn}</span>
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
              <span>{t.investigateWhyBtn}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
