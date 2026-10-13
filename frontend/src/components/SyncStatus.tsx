import React from 'react';
import { CheckCircle2, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { SyncState } from '../types';

interface SyncStatusProps {
  state: SyncState;
  queuedCount?: number;
  onRetry?: () => void;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  state,
  queuedCount = 0,
  onRetry,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'synced':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#2F7D4F]" />,
          label: 'Synced',
          message: 'All local attempts and diagnostics are backed up.',
          badgeBg: 'bg-[#E5F3E9] text-[#2F7D4F] border-[#2F7D4F]/20',
        };
      case 'queued':
        return {
          icon: <Clock className="w-4 h-4 text-[#D99A2B]" />,
          label: 'Queued offline',
          message: `${queuedCount} attempts saved locally. Will sync automatically when online.`,
          badgeBg: 'bg-[#FFF4D6] text-[#A66F0D] border-[#D99A2B]/30',
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 text-[#2A5C8A] animate-spin" />,
          label: 'Syncing',
          message: 'Uploading local diagnostic traces to learning map...',
          badgeBg: 'bg-[#E7EFF7] text-[#2A5C8A] border-[#2A5C8A]/20',
        };
      case 'retrying':
        return {
          icon: <RefreshCw className="w-4 h-4 text-[#D99A2B] animate-spin" />,
          label: 'Retrying sync',
          message: 'Connecting to network server to push records...',
          badgeBg: 'bg-[#FFF4D6] text-[#A66F0D] border-[#D99A2B]/30',
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-[#B3402F]" />,
          label: 'Sync paused',
          message: 'Safe in local storage. Tap to retry connection.',
          badgeBg: 'bg-[#FBE8E5] text-[#B3402F] border-[#B3402F]/20',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-4 rounded-[16px] bg-white border border-[#E4E0D8] ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-ui font-semibold text-sm text-[#191817]">
            Storage & Sync State
          </span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeBg}`}
        >
          {config.label}
        </span>
      </div>

      <p className="text-xs text-[#6B6A67] leading-relaxed">
        {config.message}
      </p>

      {state === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-2.5 text-xs font-medium text-[#C96442] hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Retry sync now
        </button>
      )}
    </div>
  );
};
