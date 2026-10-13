import React from 'react';
import { Eye, FlaskConical, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';

export type StepType = 'observed' | 'hypotheses' | 'tested' | 'probeResult' | 'cause' | 'counterfactual';

interface DiagnosisStepCardProps {
  stepNumber: number;
  type: StepType;
  title: string;
  content: string | React.ReactNode;
  subtitle?: string;
  isVerified?: boolean;
  className?: string;
}

export const DiagnosisStepCard: React.FC<DiagnosisStepCardProps> = ({
  stepNumber,
  type,
  title,
  content,
  subtitle,
  isVerified = false,
  className = '',
}) => {
  const getIconAndStyle = () => {
    switch (type) {
      case 'observed':
        return {
          icon: <Eye className="w-4 h-4 text-[#2A5C8A]" />,
          badgeBg: 'bg-[#E7EFF7] text-[#2A5C8A]',
          cardVariant: 'default' as const,
        };
      case 'hypotheses':
      case 'tested':
        return {
          icon: <FlaskConical className="w-4 h-4 text-[#2A5C8A]" />,
          badgeBg: 'bg-[#E7EFF7] text-[#2A5C8A]',
          cardVariant: 'soft-blue' as const,
        };
      case 'probeResult':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#2F7D4F]" />,
          badgeBg: 'bg-[#E5F3E9] text-[#2F7D4F]',
          cardVariant: 'soft-green' as const,
        };
      case 'cause':
        return {
          icon: <AlertCircle className="w-4 h-4 text-[#C96442]" />,
          badgeBg: 'bg-[#FBEAE3] text-[#C96442]',
          cardVariant: 'soft-brand' as const,
        };
      case 'counterfactual':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-[#0E7C7B]" />,
          badgeBg: 'bg-[#E3F2F1] text-[#0E7C7B]',
          cardVariant: 'soft-teal' as const,
        };
      default:
        return {
          icon: null,
          badgeBg: 'bg-[#F7F5F0] text-[#6B6A67]',
          cardVariant: 'default' as const,
        };
    }
  };

  const { icon, badgeBg, cardVariant } = getIconAndStyle();

  return (
    <Card variant={cardVariant} className={`p-4 border ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${badgeBg}`}>
          {stepNumber}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <h4 className="font-ui font-semibold text-sm text-[#191817]">
              {title}
            </h4>
            {isVerified && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5F3E9] text-[#2F7D4F] font-medium border border-[#2F7D4F]/20">
                Verified
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-[#6B6A67] mb-2">{subtitle}</p>
          )}

          <div className="text-[15px] font-ui text-[#191817] leading-relaxed">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
        </div>
      </div>
    </Card>
  );
};
