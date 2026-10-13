import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Lock, ChevronRight } from 'lucide-react';
import { ConceptNodeData } from '../types';

interface ConceptNodeProps {
  node: ConceptNodeData;
  isSelected: boolean;
  onSelect: (node: ConceptNodeData) => void;
}

export const ConceptNode: React.FC<ConceptNodeProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const getStateConfig = () => {
    switch (node.status) {
      case 'mastered':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#2F7D4F]" />,
          border: 'border-[#2F7D4F]/40 hover:border-[#2F7D4F]',
          badgeBg: 'bg-[#E5F3E9] text-[#2F7D4F]',
          dotColor: 'bg-[#2F7D4F]',
        };
      case 'language-friction':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[#D99A2B]" />,
          border: 'border-[#D99A2B]/40 hover:border-[#D99A2B]',
          badgeBg: 'bg-[#FFF4D6] text-[#A66F0D]',
          dotColor: 'bg-[#D99A2B]',
        };
      case 'prerequisite-gap':
        return {
          icon: <AlertCircle className="w-4 h-4 text-[#B3402F]" />,
          border: 'border-[#B3402F]/40 hover:border-[#B3402F]',
          badgeBg: 'bg-[#FBE8E5] text-[#B3402F]',
          dotColor: 'bg-[#B3402F]',
        };
      case 'locked':
        return {
          icon: <Lock className="w-4 h-4 text-[#6B6A67]" />,
          border: 'border-[#E4E0D8]',
          badgeBg: 'bg-[#F7F5F0] text-[#6B6A67]',
          dotColor: 'bg-[#6B6A67]',
        };
    }
  };

  const config = getStateConfig();
  const selectedRing = isSelected ? 'ring-2 ring-[#C96442] shadow-md' : 'shadow-sm';

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={`w-full text-left bg-white rounded-[16px] p-4 border transition-all duration-150 relative cursor-pointer active:scale-[0.99] ${config.border} ${selectedRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
            <h4 className="font-ui font-semibold text-[16px] text-[#191817] truncate">
              {node.title}
            </h4>
            {node.titleOdia && (
              <span className="text-xs text-[#6B6A67] font-odia truncate">
                ({node.titleOdia})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            {config.icon}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeBg}`}>
              {node.statusLabel}
            </span>
          </div>

          <p className="text-xs text-[#6B6A67] mt-2 line-clamp-2 leading-relaxed">
            {node.description}
          </p>
        </div>

        <div className="self-center shrink-0 text-[#6B6A67]">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};
