import React, { useState } from 'react';
import { ArrowRight, X, CheckCircle2, Lock, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { sampleConceptNodes } from '../data/mockData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ConceptNodeData, ScreenId } from '../types';

interface ConceptMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  concepts?: ConceptNodeData[];
}

export const ConceptMapScreen: React.FC<ConceptMapScreenProps> = ({
  onNavigate,
  concepts = sampleConceptNodes,
}) => {
  const [selectedNode, setSelectedNode] = useState<ConceptNodeData | null>(null);

  const masteredCount = concepts.filter((c) => c.status === 'mastered').length;
  const frictionCount = concepts.filter((c) => c.status === 'language-friction').length;
  const gapCount = concepts.filter((c) => c.status === 'prerequisite-gap').length;
  const lockedCount = concepts.filter((c) => c.status === 'locked').length;

  const handleNodeClick = (node: ConceptNodeData) => {
    setSelectedNode(node);
    setTimeout(() => {
      document.getElementById('concept-detail-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  return (
    <div className="space-y-4 pb-12">
      
      <header className="pt-2">
        <h1 className="font-serif-display text-2xl font-semibold text-[#191817] leading-tight">
          Your learning map
        </h1>
        <p className="text-[14px] text-[#6B6A67] font-ui mt-0.5">
          Physics · Light and Optics
        </p>
      </header>

      <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-[14px] border border-[#E4E0D8] text-center shadow-2xs">
        <div>
          <div className="font-mono font-bold text-sm text-[#2F7D4F]">{masteredCount}</div>
          <div className="text-[10px] text-[#6B6A67]">Mastered</div>
        </div>
        <div>
          <div className="font-mono font-bold text-sm text-[#D99A2B]">{frictionCount}</div>
          <div className="text-[10px] text-[#6B6A67]">Friction</div>
        </div>
        <div>
          <div className="font-mono font-bold text-sm text-[#B3402F]">{gapCount}</div>
          <div className="text-[10px] text-[#6B6A67]">Gaps</div>
        </div>
        <div>
          <div className="font-mono font-bold text-sm text-[#6B6A67]">{lockedCount}</div>
          <div className="text-[10px] text-[#6B6A67]">Locked</div>
        </div>
      </div>

      <div className="space-y-3 relative" role="list" aria-label="Concept sequence">
        {concepts.map((node, index) => {
          const isSelected = selectedNode?.id === node.id;

          let borderClass = 'border-[#E4E0D8]';
          let statusBadgeClass = 'bg-[#F7F5F0] text-[#6B6A67]';
          let StatusIcon = Lock;

          if (node.status === 'mastered') {
            borderClass = 'border-[#2F7D4F]/30 hover:border-[#2F7D4F]';
            statusBadgeClass = 'bg-[#E5F3E9] text-[#2F7D4F]';
            StatusIcon = CheckCircle2;
          } else if (node.status === 'language-friction') {
            borderClass = 'border-[#D99A2B]/40 hover:border-[#D99A2B]';
            statusBadgeClass = 'bg-[#FFF4D6] text-[#A66F0D]';
            StatusIcon = AlertTriangle;
          } else if (node.status === 'prerequisite-gap') {
            borderClass = 'border-[#B3402F]/30 hover:border-[#B3402F]';
            statusBadgeClass = 'bg-[#FBE8E5] text-[#B3402F]';
            StatusIcon = AlertCircle;
          } else if (node.status === 'locked') {
            borderClass = 'border-[#E4E0D8] opacity-75';
            statusBadgeClass = 'bg-[#F7F5F0] text-[#6B6A67]';
            StatusIcon = Lock;
          }

          return (
            <div key={node.id} className="relative">
              
              {index < concepts.length - 1 && (
                <div
                  className="absolute left-7 -bottom-3.5 w-0.5 h-3.5 bg-[#E4E0D8] z-0"
                  aria-hidden="true"
                />
              )}

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleNodeClick(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(node);
                  }
                }}
                className={`w-full bg-white rounded-[20px] p-4 border transition-all duration-150 cursor-pointer text-left select-none shadow-2xs ${borderClass} ${
                  isSelected ? 'ring-2 ring-[#C96442] shadow-sm' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] flex items-center justify-center shrink-0 mt-0.5">
                      <StatusIcon className="w-4 h-4 text-current" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h2 className="font-ui font-semibold text-[16px] text-[#191817]">
                          {node.title}
                        </h2>
                        {node.titleOdia && (
                          <span className="text-xs text-[#6B6A67] font-odia">
                            ({node.titleOdia})
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                          {node.statusLabel}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B6A67] mt-1.5 line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#C96442] hover:underline"
                    >
                      {node.status === 'language-friction' ? 'Investigate' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedNode && (
        <Card
          id="concept-detail-card"
          variant={
            selectedNode.status === 'mastered'
              ? 'soft-green'
              : selectedNode.status === 'language-friction'
              ? 'soft-gold'
              : selectedNode.status === 'prerequisite-gap'
              ? 'soft-brand'
              : 'default'
          }
          className="p-5 border border-[#E4E0D8] relative animate-in fade-in duration-150"
        >
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
            className="absolute top-4 right-4 p-1 rounded-full text-[#6B6A67] hover:text-[#191817] hover:bg-white/80 cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif-display text-lg font-bold text-[#191817]">
              {selectedNode.title}
            </h3>
            {selectedNode.titleOdia && (
              <span className="text-sm text-[#6B6A67] font-odia">
                ({selectedNode.titleOdia})
              </span>
            )}
          </div>

          <div className="text-xs font-semibold mb-2">
            Status: <span className="underline decoration-dotted">{selectedNode.statusLabel}</span>
          </div>

          <p className="text-xs text-[#191817] leading-relaxed mb-3">
            {selectedNode.description}
          </p>

          {selectedNode.dependsOn && (
            <div className="text-xs text-[#6B6A67] mb-3 bg-white/80 p-2.5 rounded-xl border border-[#E4E0D8]/60">
              <strong className="text-[#191817]">Prerequisite requirement: </strong>
              Requires firm mastery of {selectedNode.dependsOn} before unlocking.
            </div>
          )}

          <div className="pt-2 border-t border-[#E4E0D8]/60">
            {selectedNode.status === 'language-friction' && (
              <Button
                fullWidth
                size="default"
                onClick={() => onNavigate('why-engine')}
                className="text-sm font-semibold"
              >
                <span>Open WHY Engine diagnosis & repair (+4 marks)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {selectedNode.status === 'prerequisite-gap' && (
              <Button
                fullWidth
                size="default"
                onClick={() => onNavigate('mock-test')}
                className="bg-[#B3402F] hover:bg-[#963425] text-sm font-semibold"
              >
                <span>Review ratio prerequisite concept</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {selectedNode.status === 'mastered' && (
              <div className="text-xs text-[#2F7D4F] font-semibold flex items-center justify-center gap-1.5 py-1.5 bg-white rounded-lg border border-[#2F7D4F]/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Concept mastered with 92% exam accuracy</span>
              </div>
            )}

            {selectedNode.status === 'locked' && (
              <div className="text-xs text-[#6B6A67] bg-white p-3 rounded-lg border border-[#E4E0D8] space-y-1">
                <div className="font-semibold text-[#191817] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>How to unlock this concept:</span>
                </div>
                <p>
                  1. Complete the Refraction terminology bridge in Plan.<br />
                  2. Repair the Ratio and proportion prerequisite gap.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="p-3.5 bg-[#F7F5F0] rounded-[14px] border border-[#E4E0D8] text-xs text-[#6B6A67] leading-relaxed">
        <span className="font-semibold text-[#191817]">Relationship graph:</span> Concepts build progressively. You don't have to tackle everything at once—repair avoidable terminology and ratio friction first.
      </div>
    </div>
  );
};
